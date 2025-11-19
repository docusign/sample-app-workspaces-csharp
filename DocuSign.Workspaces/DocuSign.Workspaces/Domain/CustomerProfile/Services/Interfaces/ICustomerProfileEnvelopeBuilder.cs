using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.CustomerProfile.Models;

namespace DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces
{
    public interface ICustomerProfileEnvelopeBuilder
    {
        EnvelopeDefinition BuildUserProfileUpdateEnvelope(string eventNotificationUrl, string clientUserId, string serverTemplateId, CustomerProfileSignerInfo signerInfo, AccountIdentityVerificationWorkflow identityVerificationWorkflow);
    }
}