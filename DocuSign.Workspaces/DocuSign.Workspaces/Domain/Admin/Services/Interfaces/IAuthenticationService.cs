using System.Collections.Generic;
using System.Security.Claims;
using DocuSign.Workspaces.Controllers.Admin.Model;
using DocuSign.Workspaces.Domain.Admin.Models;

namespace DocuSign.Workspaces.Domain.Admin.Services.Interfaces
{
    public interface IAuthenticationService
    {
        ClaimsPrincipal AuthenticateFromJwt(AccountConnectionSettings connectionSettings);
        string CreateAdminConsentUrl(string baseUrl, string redirectUrl);
        string CreateUserConsentUrl(string baseUrl, string redirectUrl);
        void AuthenticateForProfileManagement(string login, string password);
        string PrePopulateUserId(string basePath, string code);
        List<ResponseGetAccountsModel> GetAccounts(string basePath, string userId);
    }
}