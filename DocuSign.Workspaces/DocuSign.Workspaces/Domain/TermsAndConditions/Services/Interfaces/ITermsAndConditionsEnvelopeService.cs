using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.TermsAndConditions.Models;

namespace DocuSign.Workspaces.Domain.TermsAndConditions.Services.Interfaces
{
    public interface ITermsAndConditionsEnvelopeService
    {
        CreateEnvelopeResponse CreateTermsAndConditionsWithContractEnvelop(string accountId, SignerInfo signerInfo, CarbonCopyInfo carbonCopyInfo);
    }
}