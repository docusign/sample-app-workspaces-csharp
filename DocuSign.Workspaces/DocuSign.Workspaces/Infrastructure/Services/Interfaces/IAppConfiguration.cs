using DocuSign.Workspaces.Domain.CustomerProfile.Models;
using DocuSign.Workspaces.Infrastructure.Models;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface IAppConfiguration
    {
        AppConfigurationCustomerProfile CustomerProfile { get; set; }
        AppConfigurationDocuSign DocuSign { get; set; }
    }
}