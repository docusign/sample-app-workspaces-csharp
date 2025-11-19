using System.Collections.Generic;
using DocuSign.Workspaces.Infrustructure.Model;

namespace DocuSign.Workspaces.Controllers.Events.Model
{
    public class SignerModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public IEnumerable<DataSourceItem> Tabs { get; set; }
    }
}
