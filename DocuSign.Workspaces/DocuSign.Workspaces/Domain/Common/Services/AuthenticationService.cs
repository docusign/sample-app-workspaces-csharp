using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using DocuSign.eSign.Client;
using DocuSign.eSign.Client.Auth;
using DocuSign.Workspaces.Controllers.Admin.Models;
using DocuSign.Workspaces.Domain.Admin.Models;
using DocuSign.Workspaces.Domain.Admin.Services.Interfaces;
using DocuSign.Workspaces.Infrastructure.Exceptions;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.Cookies;
using IAuthenticationService = DocuSign.Workspaces.Domain.Admin.Services.Interfaces.IAuthenticationService;

namespace DocuSign.Workspaces.Domain.Common.Services
{
    public class AuthenticationService : IAuthenticationService
    {
        private readonly IAppConfiguration _appConfiguration;
        private readonly IDocuSignClientsFactory _docuSignClientsFactory;
        private readonly ISettingsRepository _settingsRepository;

        public AuthenticationService(
            IDocuSignClientsFactory docuSignClientsFactory,
            IAppConfiguration appConfiguration,
            ISettingsRepository settingsRepository)
        {
            _docuSignClientsFactory = docuSignClientsFactory;
            _appConfiguration = appConfiguration;
            _settingsRepository = settingsRepository;
        }

        public string PrePopulateUserId(string basePath, string code)
        {
            var authServer = new Uri(basePath).Host;
            var apiClient = _docuSignClientsFactory.BuildDocuSignAuthClient(authServer);
            OAuth.OAuthToken authToken;
            if (authServer.Contains("-d")) // demo
            {
                authToken = apiClient.GenerateAccessToken(_appConfiguration.DocuSign.IntegrationKey, _appConfiguration.DocuSign.SecretKey, code);
            }
            else // prod
            {
                authToken = apiClient.GenerateAccessToken(_appConfiguration.DocuSign.IntegrationKey, _appConfiguration.DocuSign.SecretKeyProd, code);
            }

            var userInfo = apiClient.GetUserInfo(authToken.access_token);

            return userInfo.Sub;
        }

        public async Task<List<ResponseGetAccountsModel>> GetAccountsAsync(string basePath, string userId)
        {
            var settings = _settingsRepository.Get();

            var authServer = new Uri(basePath).Host;
            var apiClient = _docuSignClientsFactory.BuildDocuSignAuthClient(authServer);

            OAuth.OAuthToken authToken;
            try
            {
                if (settings.IsConsentGranted)
                {
                    authToken = await apiClient.GenerateAccessTokenAsync(
                        _appConfiguration.DocuSign.IntegrationKey,
                        _appConfiguration.DocuSign.SecretKey,
                        settings.AuthCode);
                }
                else
                {
                    authToken = await apiClient.RequestJWTUserTokenAsync(
                        _appConfiguration.DocuSign.IntegrationKey,
                        userId,
                        authServer,
                        await File.ReadAllBytesAsync(_appConfiguration.DocuSign.RSAPrivateKeyFile),
                        _appConfiguration.DocuSign.JWTLifeTime,
                        new List<string> { "signature", "dtr.company.read", "dtr.rooms.read", "dtr.rooms.write", "dtr.documents.write" });
                }
            }
            catch (ApiException ex)
            {
                throw new ApplicationApiException(ex);
            }

            var userInfo = await apiClient.GetUserInfoAsync(authToken.access_token);

            return userInfo.Accounts.Select(a => new ResponseGetAccountsModel
            {
                AccountId = a.AccountId,
                AccountName = a.AccountName,
                BaseUri = a.BaseUri,
                IsDefault = bool.Parse(a.IsDefault)
            }).ToList();
        }

        public async Task<ClaimsPrincipal> AuthenticateFromJwtAsync(AccountConnectionSettings accountConnectionSettings)
        {
            var settings = _settingsRepository.Get();
            var authServer = new Uri(accountConnectionSettings.BasePath).Host;
            var apiClient = _docuSignClientsFactory.BuildDocuSignAuthClient(authServer);
            OAuth.OAuthToken authToken;
            try
            {
                if (settings.IsConsentGranted)
                {
                    authToken = await apiClient.GenerateAccessTokenAsync(
                        _appConfiguration.DocuSign.IntegrationKey,
                        _appConfiguration.DocuSign.SecretKey,
                        settings.AuthCode);
                }
                else
                {
                    authToken = await apiClient.RequestJWTUserTokenAsync(
                        _appConfiguration.DocuSign.IntegrationKey,
                        accountConnectionSettings.UserId,
                        authServer,
                        await File.ReadAllBytesAsync(_appConfiguration.DocuSign.RSAPrivateKeyFile),
                        _appConfiguration.DocuSign.JWTLifeTime,
                        new List<string> { "signature", "impersonation", "dtr.company.read", "dtr.rooms.read", "dtr.rooms.write", "dtr.documents.write" });
                }
            }
            catch (ApiException ex)
            {
                throw new ApplicationApiException(ex);
            }

            var userInfo = apiClient.GetUserInfo(authToken.access_token);
            var account = userInfo.Accounts.SingleOrDefault(x => x.AccountId == accountConnectionSettings.AccountId);

            if (account == null)
            {
                throw ApplicationApiException.CreateInvalidAccountException();
            }

            if (account.BaseUri != accountConnectionSettings.BaseUri)
            {
                throw ApplicationApiException.CreateInvalidBaseUriException();
            }

            var claims = new List<Claim>
            {
                new ("access_token", authToken.access_token),
                new (ClaimTypes.NameIdentifier, userInfo.Sub),
                new (ClaimTypes.Name, userInfo.Name),
                new (ClaimTypes.Email, userInfo.Email),
                new ("base_uri", account.BaseUri),
                new ("account_name", account.AccountName),
                new ("account_id", accountConnectionSettings.AccountId)
            };

            var claimsIdentity = new ClaimsIdentity(
                claims,
                CookieAuthenticationDefaults.AuthenticationScheme);

            return new ClaimsPrincipal(claimsIdentity);
        }

        public string CreateUserConsentUrl(string baseUrl, string redirectUrl)
        {
            var integrationKey = _appConfiguration.DocuSign.IntegrationKey;
            var scope = "signature dtr.company.read dtr.rooms.read dtr.rooms.write dtr.documents.write";
            var fullRedirectUrl = $"{_appConfiguration.DocuSign.RedirectBaseUrl}/{redirectUrl}";

            var builder = new UriBuilder($"{baseUrl}/oauth/auth?response_type=code&scope={scope}&client_id={integrationKey}&redirect_uri={fullRedirectUrl}");
            return builder.ToString();
        }

        public string CreateTestAccountConsentUrl(string baseUrl, string redirectUrl)
        {
            var integrationKey = _appConfiguration.DocuSign.IntegrationKey;
            const string scope = "signature impersonation dtr.company.read dtr.rooms.read dtr.rooms.write dtr.documents.write";
            var fullRedirectUrl = $"{_appConfiguration.DocuSign.RedirectBaseUrl}/{redirectUrl}";

            var builder = new UriBuilder($"{baseUrl}/oauth/auth?response_type=code&scope={scope}&client_id={integrationKey}&redirect_uri={fullRedirectUrl}");
            return builder.ToString();
        }
    }
}
