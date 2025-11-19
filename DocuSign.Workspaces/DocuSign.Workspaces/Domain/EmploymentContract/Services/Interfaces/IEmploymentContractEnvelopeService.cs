using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.EmploymentContract.Models;
using DocuSign.Workspaces.Infrustructure.Model;

namespace DocuSign.Workspaces.Domain.EmploymentContract.Services.Interfaces
{
    public interface IEmploymentContractEnvelopeService
    {
        CreateEnvelopeResponse CreateEmploymentContractEnvelop(EnvelopeAction envelopAction, string templateId, string accountId, string redirectUrl, SignerInfo signerInfo, SignatureInfo signatureInfo);
    }
}