using System;

namespace DocuSign.Workspaces.Controllers.Events.Models
{
    public class DocuSignEventModel
    {
        public string Event { get; set; }
        public DateTime GeneratedDateTime { get; set; }
        public DocuSignEventDataModel Data { get; set; }
    }
}
