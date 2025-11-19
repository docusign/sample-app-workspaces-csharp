using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.Common.Models;

namespace DocuSign.Workspaces.Domain.CustomQuote.Services.Interfaces
{
    public interface ICustomQuoteEnvelopeBuilder
    {
        EnvelopeDefinition BuildCustomQuoteEnvelope(string eventNotificationUrl, SignerInfo signerInfo);
    }
}