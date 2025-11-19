using System;

namespace DocuSign.Workspaces.Controllers.Admin.Model
{
    public class ResponseAccountAuthorizeModel
    {
        public ResponseAccountAuthorizeModel(string redirectUrl)
        {
            RedirectUrl = redirectUrl;
        }

        public string RedirectUrl { get; set; }
    }
}
