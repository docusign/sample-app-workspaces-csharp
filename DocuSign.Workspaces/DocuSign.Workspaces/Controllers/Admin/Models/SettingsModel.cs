using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.Admin.Models;
using System.Collections.Generic;

namespace DocuSign.Workspaces.Controllers.Admin.Model
{
    public class SettingsModel
    {
        public string BasePath { get; set; }
        public string BaseUri { get; set; }
        public string AccountId { get; set; }
        public string UserId { get; set; }
        public string SignatureType { get; set; }
        public string Template { get; set; }
        public UserProfileSettings UserProfile { get; set; }
    }
}
