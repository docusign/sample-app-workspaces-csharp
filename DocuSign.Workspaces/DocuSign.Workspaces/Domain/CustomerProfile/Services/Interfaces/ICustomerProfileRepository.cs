using DocuSign.Workspaces.Domain.CustomerProfile.Models;

namespace DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces
{
    public interface ICustomerProfileRepository
    {
        string Login { get; }
        string Password { get; }
        CustomerProfileSignerInfo ProfileSignerInfo { get; }
    }
}