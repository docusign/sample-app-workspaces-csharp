using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Domain.Common.Models;

namespace DocuSign.Workspaces.Domain.CustomQuote.Services.Interfaces
{
    public interface ICustomQuoteEnvelopeService
    {
        CreateEnvelopeResponse CreateCustomQuoteEnvelop(string accountId, SignerInfo signerInfo);
    }
}