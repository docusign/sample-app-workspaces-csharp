using System.Collections.Generic;
using DocuSign.Workspaces.Infrustructure.Model;

namespace DocuSign.Workspaces.Controllers.Admin.Model
{
    public class DataSourceModel
    {
        public IEnumerable<DataSourceItem> Templates { get; set; }
        public IEnumerable<DataSourceItem> SignatureTypes { get; set; }
    }
}
