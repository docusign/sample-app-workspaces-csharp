using System;

namespace DocuSign.Workspaces.Controllers.Events.Models
{
    public class EventModel
    {
        public string UseCase { get; set; }
        public string Event { get; set; }
        public DateTime Date { get; set; }
        public SignerModel Signer { get; set; }
    }
}
