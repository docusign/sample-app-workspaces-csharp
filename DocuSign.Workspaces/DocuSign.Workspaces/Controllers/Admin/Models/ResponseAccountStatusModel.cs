namespace DocuSign.Workspaces.Controllers.Admin.Models
{
    public class ResponseAccountStatusModel
    {
        public ConnectedUserModel ConnectedUser { get; set; }
        public bool IsConsentGranted { get; set; }
        public bool IsConnected { get; set; }
    }
}