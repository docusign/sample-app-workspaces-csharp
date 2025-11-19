using System;

namespace DocuSign.Workspaces.Controllers.Admin.Model
{
    public class RequestAccountAuthorizeModel
    {
        public string BasePath { get; set; }
        public string RedirectUrl { get; set; }
        public ConsentType ConsentType { get; set; }
    }
}
