using System.Collections.Generic;
using DocuSign.Workspaces.Infrastructure.Models;

namespace DocuSign.Workspaces.Controllers.Admin.Models
{
    public class DataSourceModel
    {
        public IEnumerable<DataSourceItem> Templates { get; set; }
        public IEnumerable<DataSourceItem> SignatureTypes { get; set; }
    }
}
