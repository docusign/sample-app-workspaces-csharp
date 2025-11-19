using DocuSign.Workspaces.Domain.CustomerProfile.Models;
using DocuSign.Workspaces.Infrustructure.Model;

namespace DocuSign.Workspaces.Infrustructure.Services.Interfaces
{
    public interface IAppConfiguration
    {
        AppConfigurationCustomerProfile CustomerProfile { get; set; }
        AppConfigurationDocuSign DocuSign { get; set; }
    }
}