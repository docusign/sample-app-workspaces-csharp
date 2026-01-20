using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using DocuSign.Workspaces.Controllers.Admin.Models;
using DocuSign.Workspaces.Domain.Admin.Models;

namespace DocuSign.Workspaces.Domain.Admin.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<ClaimsPrincipal> AuthenticateFromJwtAsync(AccountConnectionSettings accountConnectionSettings);

        string CreateAdminConsentUrl(string baseUrl, string redirectUrl);

        string CreateUserConsentUrl(string baseUrl, string redirectUrl);

        void AuthenticateForProfileManagement(string login, string password);

        string PrePopulateUserId(string basePath, string code);

        Task<List<ResponseGetAccountsModel>> GetAccountsAsync(string basePath, string userId);
    }
}
