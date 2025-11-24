using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.EmploymentContract.Models;
using DocuSign.Workspaces.Infrastructure.Models;

namespace DocuSign.Workspaces.Domain.EmploymentContract.Services.Interfaces
{
    public interface IEmploymentContractEnvelopeBuilder
    {
        EnvelopeDefinition BuildEmploymentContractEnvelope(string eventNotificationUrl, EnvelopeAction envelopAction, string serverTemplateId, SignerInfo signerInfo, SignatureInfo signatureInfo);
    }
}