using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Domain.CustomerProfile.Models;

namespace DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces
{
    public interface ICustomerProfileEnvelopeService
    {
        CreateEnvelopeResponse CreateUpdateProfileEnvelope(string accountId, string redirectUrl, CustomerProfileSignerInfo signerInfo);
    }
}