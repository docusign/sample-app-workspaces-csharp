namespace DocuSign.Workspaces.Controllers.Admin.Models
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
