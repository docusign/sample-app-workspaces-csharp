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
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using IAuthenticationService = DocuSign.Workspaces.Domain.Admin.Services.Interfaces.IAuthenticationService;

namespace DocuSign.Workspaces.Controllers.Admin
{
    public class AdminController(
        IAuthenticationService authenticationService,
        ISettingsRepository settingsRepository,
        IAccountRepository accountRepository,
        IDocuSignApiProvider docuSignApiProvider,
        ITestAccountConnectionSettingsRepository testAccountConnectionSettingsRepository)
        : Controller
    {

        [HttpPost]
        [Route("/api/account/consent/obtain")]
        public IActionResult ObtainConsent([FromBody] RequestAccountAuthorizeModel model)
        {
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
            return LocalRedirect("/");
        }

        [HttpGet]
        [Route("/api/accounts")]
        public async Task<IActionResult> GetAccounts(string basePath, string userId)
        {
            try
            {
                var result = await authenticationService.GetAccountsAsync(
                    basePath, userId);
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
            try
            {
                var principal = await authenticationService.AuthenticateFromJwtAsync(connectionSettings);

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal);
                HttpContext.User = principal;

                var settings = settingsRepository.Get();
                settings.AuthenticationType = model.AuthenticationType;
                settings.UserId = model.UserId;
                settings.AccountId = model.AccountId;
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
                AuthenticationType.UserAccount => new AccountConnectionSettings
                {
                    BasePath = model.BasePath,
                    BaseUri = model.BaseUri,
                    AccountId = model.AccountId,
                    UserId = model.UserId
                },
                AuthenticationType.TestAccount => testAccountConnectionSettingsRepository.Get(),
                _ => null
            };

            return connectionSettings;
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
