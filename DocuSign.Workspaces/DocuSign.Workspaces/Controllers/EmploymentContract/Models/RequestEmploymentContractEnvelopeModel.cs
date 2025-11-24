using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Domain.EmploymentContract.Models;

namespace DocuSign.Workspaces.Controllers.EmploymentContract.Models
{
    public class RequestEmploymentContractEnvelopeModel
    {
        public EnvelopeAction EnvelopeAction { get; set; }
        public string Template { get; set; }
        public string RedirectUrl { get; set; }
        public SignerInfoModel SignerInfo { get; set; }
        public SignatureInfoModel SignatureInfo { get; set; }
    }
}
