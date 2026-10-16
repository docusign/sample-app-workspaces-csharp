using System;
using DocuSign.Workspaces.Domain.Admin.Models;
using DocuSign.Workspaces.Domain.Admin.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DocuSign.Workspaces.Controllers.Admin.Models;
using DocuSign.Workspaces.Infrastructure.Exceptions;
using DocuSign.Workspaces.Infrastructure.Models;
using DocuSign.Workspaces.Infrastructure.Validation;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.Extensions.Logging;
using IAuthenticationService = DocuSign.Workspaces.Domain.Admin.Services.Interfaces.IAuthenticationService;

namespace DocuSign.Workspaces.Controllers.Admin
{
    public class AdminController(
        IAuthenticationService authenticationService,
        ISettingsRepository settingsRepository,
        IAccountRepository accountRepository,
        IDocuSignApiProvider docuSignApiProvider,
        ITestAccountConnectionSettingsRepository testAccountConnectionSettingsRepository,
        IAppConfiguration appConfiguration,
        ILogger<AdminController> logger)
        : Controller
    {

        [HttpPost]
        [Route("/api/account/consent/obtain")]
        public IActionResult ObtainConsent([FromBody] RequestAccountAuthorizeModel model)
        {
            try
            {
                DocuSignEndpointValidator.ValidateBasePath(model.BasePath);
            }
            catch (ArgumentException)
            {
                logger.LogWarning("Rejected basePath in consent request: {BasePath}", model.BasePath);
                return BadRequest("Invalid basePath. Must be a known DocuSign authentication endpoint using HTTPS.");
            }

            var settings = settingsRepository.Get();
            settings.BasePath = model.BasePath;
            settingsRepository.Save(settings);

            return model.ConsentType switch
            {
                ConsentType.Individual => Ok(new ResponseAccountAuthorizeModel(authenticationService.CreateUserConsentUrl(model.BasePath, "api/consentcallback"))),
                _ => BadRequest("Unknown consent type")
            };
        }

        [HttpGet]
        [Route("/api/account/consent/remove")]
        public IActionResult RemoveConsent()
        {
            var settings = settingsRepository.Get();
            settings.IsConsentGranted = false;
            settingsRepository.Save(settings);
            return NoContent();
        }

        [HttpGet]
        [Route("/api/consentcallback")]
        public IActionResult ConsentCallback(string code)
        {
            var settings = settingsRepository.Get();
            settings.IsConsentGranted = true;
            settings.UserId = authenticationService.PrePopulateUserId(settings.BasePath, code);
            settings.AuthCode = code;
            settingsRepository.Save(settings);
            
            // Redirect to client app URL (frontend) instead of backend
            var redirectUrl = !string.IsNullOrEmpty(appConfiguration.ClientAppUrl) 
                ? appConfiguration.ClientAppUrl 
                : "/";
            return Redirect(redirectUrl);
        }

        [HttpGet]
        [Route("/api/accounts")]
        public async Task<IActionResult> GetAccounts()
        {
            var settings = settingsRepository.Get();
            if (!settings.IsConsentGranted || string.IsNullOrEmpty(settings.UserId))
            {
                logger.LogWarning("Accounts request rejected: consent not granted or userId missing");
                return BadRequest("Consent must be granted before listing accounts.");
            }

            try
            {
                var result = await authenticationService.GetAccountsAsync();
                return Ok(result);
            }
            catch (ApplicationApiException ex)
            {
                return BadRequest(ex.Details.Error);
            }
        }

        [HttpPost]
        [Route("/api/account/connect")]
        public async Task<IActionResult> Connect([FromBody] RequestAccountConnectModel model)
        {
            var connectionSettings = CreateConnectionSettings(model);
            if (connectionSettings == null)
            {
                logger.LogWarning("Connect request rejected: invalid auth type or missing consent. AuthType={AuthType}", model.AuthenticationType);
                return BadRequest("Invalid authentication type.");
            }

            try
            {
                var principal = await authenticationService.AuthenticateFromJwtAsync(connectionSettings);

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal);
                HttpContext.User = principal;

                var settings = settingsRepository.Get();
                settings.AuthenticationType = model.AuthenticationType;
                settings.UserId = connectionSettings.UserId;
                settings.AccountId = connectionSettings.AccountId;
                settings.BaseUri = model.BaseUri;
                settings.Template = TemplateNames.DefaultTemplateId;
                settings.SignatureTypesDataSource = GetSignatureTypesDataSource(connectionSettings.AccountId);
                settings.SignatureType = SignatureInfo.DefaultProviderName;
                settingsRepository.Save(settings);
            }
            catch (ApplicationApiException)
            {
                var consentUrl = authenticationService.CreateTestAccountConsentUrl(connectionSettings.BasePath, "");
                return Ok(new { redirectUrl = consentUrl });
            }

            return NoContent();
        }

        [HttpGet]
        [Route("/api/account/status")]
        public IActionResult GetStatus()
        {
            var model = new ResponseAccountStatusModel
            {
                ConnectedUser = new ConnectedUserModel
                {
                    Name = HttpContext.User.Identity?.Name ?? string.Empty,
                    Email = accountRepository.Email,
                    AccountName = accountRepository.AccountName
                },
                IsConsentGranted = settingsRepository.Get().IsConsentGranted,
                IsConnected = HttpContext.User.Identity != null && HttpContext.User.Identity.IsAuthenticated
            };
            return Ok(model);
        }

        [Authorize]
        [HttpGet]
        [Route("/api/account/disconnect")]
        public async Task<IActionResult> Disconnect()
        {
            await HttpContext.SignOutAsync();
            var settings = settingsRepository.Get();
            settings.Template = null;
            settings.SignatureType = null;
            settings.TemplatesDataSource = null;
            settings.SignatureTypesDataSource = null;
            settingsRepository.Save(settings);
            return NoContent();
        }

        [Authorize]
        [HttpGet]
        [Route("/api/account/logout")]
        public async Task<IActionResult> Logout()
        {
            HttpContext.Session.Clear();
            await HttpContext.SignOutAsync();

            return NoContent();
        }

        [HttpGet]
        [Route("/api/settings")]
        public IActionResult GetSetting()
        {
            var settings = settingsRepository.Get();
            return Ok(new SettingsModel
            {
                BasePath = settings.BasePath,
                BaseUri = settings.BaseUri,
                AccountId = settings.AccountId,
                UserId = settings.UserId,
                Template = settings.Template,
                SignatureType = settings.SignatureType,
                UserProfile = settings.UserProfile
            });
        }

        [Authorize]
        [HttpGet]
        [Route("/api/settings/datasource")]
        public IActionResult GetDatasource()
        {
            var settings = settingsRepository.Get();
            return Ok(new DataSourceModel
            {
                SignatureTypes = settings.SignatureTypesDataSource,
                Templates = settings.TemplatesDataSource,
            });
        }

        [Authorize]
        [HttpPut]
        [Route("/api/settings")]
        public IActionResult SetSettings([FromBody] SettingsModel model)
        {
            var settings = settingsRepository.Get();
            settings.BaseUri = settings.BaseUri;
            settings.UserId = model.UserId;
            settings.AccountId = model.AccountId;
            settings.Template = model.Template;
            settings.SignatureType = model.SignatureType;
            settings.UserProfile = model.UserProfile;
            settingsRepository.Save(settings);

            return Ok(model);
        }

        private AccountConnectionSettings CreateConnectionSettings(RequestAccountConnectModel model)
        {
            var connectionSettings = model.AuthenticationType switch
            {
                AuthenticationType.UserAccount => CreateUserAccountConnectionSettings(model),
                AuthenticationType.TestAccount => testAccountConnectionSettingsRepository.Get(),
                _ => null
            };

            return connectionSettings;
        }

        private AccountConnectionSettings CreateUserAccountConnectionSettings(RequestAccountConnectModel model)
        {
            var settings = settingsRepository.Get();
            if (!settings.IsConsentGranted || string.IsNullOrEmpty(settings.UserId) || string.IsNullOrEmpty(settings.BasePath))
                return null;

            return new AccountConnectionSettings
            {
                BasePath = settings.BasePath,
                BaseUri = model.BaseUri,
                AccountId = model.AccountId,
                UserId = settings.UserId
            };
        }

        private IEnumerable<DataSourceItem> GetSignatureTypesDataSource(string accountId)
        {
            var signatureProviders = docuSignApiProvider.AccountsApi.ListSignatureProviders(accountId);
            var result = new List<DataSourceItem>
            {
                new()
                {
                    Key = SignatureInfo.DefaultProviderName,
                    Value = SignatureInfo.DefaultProviderDisplayName
                }
            };

            result.AddRange(signatureProviders.SignatureProviders.Select(p => new DataSourceItem(p.SignatureProviderName, p.SignatureProviderDisplayName)));
            return result;
        }
    }
}
