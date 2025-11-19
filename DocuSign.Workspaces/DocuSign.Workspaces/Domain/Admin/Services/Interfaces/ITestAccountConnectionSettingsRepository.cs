using DocuSign.Workspaces.Domain.Admin.Models;

namespace DocuSign.Workspaces.Domain.Admin.Services.Interfaces
{
    public interface ITestAccountConnectionSettingsRepository
    {
        AccountConnectionSettings Get();
    }
}