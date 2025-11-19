using System;
using DocuSign.Workspaces.Domain.Admin.Models;

namespace DocuSign.Workspaces.Controllers.Admin.Model
{
    public class RequestAccountConnectModel
    {
        public AuthenticationType AuthenticationType { get; set; }
        public string BasePath { get; set; }
        public string BaseUri { get; set; }
        public string AccountId { get; set; }
        public string UserId { get; set; }
    }
}

