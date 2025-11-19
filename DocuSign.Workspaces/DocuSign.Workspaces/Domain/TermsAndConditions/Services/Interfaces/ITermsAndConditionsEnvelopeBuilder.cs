using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.TermsAndConditions.Models;

namespace DocuSign.Workspaces.Domain.TermsAndConditions.Services.Interfaces
{
    public interface ITermsAndConditionsEnvelopeBuilder
    {
        EnvelopeDefinition BuildTermsAndConditionsWithContractEnvelope(string eventNotificationUrl, string contractTemplateId, string termsAndConditionsTemplateId, SignerInfo signerInfo, CarbonCopyInfo carbonCopyInfo);
    }
}