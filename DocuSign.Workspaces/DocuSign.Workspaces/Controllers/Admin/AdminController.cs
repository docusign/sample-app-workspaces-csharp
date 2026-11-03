using System;
using DocuSign.Workspaces.Domain.Admin.Models;
using DocuSign.Workspaces.Domain.Admin.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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

            if (model.ConsentType != ConsentType.Individual)
                return BadRequest("Unknown consent type");

            // Binds the consent round trip to this browser session so a callback carrying someone else's code is rejected
            var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var settings = settingsRepository.Get();
            settings.BasePath = model.BasePath;
            settings.ConsentState = state;
            settingsRepository.Save(settings);

            return Ok(new ResponseAccountAuthorizeModel(authenticationService.CreateUserConsentUrl(model.BasePath, "api/consentcallback", state)));
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
        public IActionResult ConsentCallback(string code, string state)
        {
            var settings = settingsRepository.Get();
            var expectedState = settings.ConsentState;
            settings.ConsentState = null; // single use
            if (string.IsNullOrEmpty(expectedState) || string.IsNullOrEmpty(code) || !StateMatches(expectedState, state))
            {
                settingsRepository.Save(settings);
                logger.LogWarning("Consent callback rejected: missing or mismatched state");
                return BadRequest("Invalid consent state.");
            }

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
            // UserId and AccountId are established by consent and /api/account/connect only; never taken from the caller
            settings.Template = model.Template;
            settings.SignatureType = model.SignatureType;
            settings.UserProfile = model.UserProfile;
            settingsRepository.Save(settings);

            return Ok(model);
        }

        private static bool StateMatches(string expected, string actual)
        {
            return actual != null && CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(actual));
        }

        private AccountConnectionSettings CreateConnectionSettings(RequestAccountConnectModel model)
        {
            // TestAccount is intentionally not accepted: it would create a session for a fixed server-configured user without any login
            var connectionSettings = model.AuthenticationType switch
            {
                AuthenticationType.UserAccount => CreateUserAccountConnectionSettings(model),
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
