using System.Collections.Generic;
using DocuSign.Workspaces.Infrastructure.Models;

namespace DocuSign.Workspaces.Controllers.Events.Models
{
    public class SignerModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public IEnumerable<DataSourceItem> Tabs { get; set; }
    }
}
