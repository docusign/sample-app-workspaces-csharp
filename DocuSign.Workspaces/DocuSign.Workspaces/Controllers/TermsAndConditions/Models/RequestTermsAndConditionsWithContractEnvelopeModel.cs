using DocuSign.Workspaces.Controllers.Common.Models;

namespace DocuSign.Workspaces.Controllers.TermsAndConditions.Model
{
    public class RequestTermsAndConditionsWithContractEnvelopeModel
    {
        public SignerInfoModel SignerInfo { get; set; }
        public CarbonCopyInfoModel CarbonCopyInfo { get; set; }
    }
}
