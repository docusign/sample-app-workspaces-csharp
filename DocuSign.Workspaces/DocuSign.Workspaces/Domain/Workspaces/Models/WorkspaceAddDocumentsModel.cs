using System.Collections.Generic;

namespace DocuSign.Workspaces.Domain.Workspaces.Models;

public class WorkspaceAddDocumentsModel
{
    public string AccountId { get; set; }
    public string WorkspaceId { get; set; }
    public List<string> Documents { get; set; }
}
