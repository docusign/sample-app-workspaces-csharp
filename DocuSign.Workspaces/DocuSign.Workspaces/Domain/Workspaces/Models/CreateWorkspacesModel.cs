namespace DocuSign.Workspaces.Domain.Workspaces.Models;

public class CreateWorkspacesModel
{
    public string WorkspacesName { get; set; }

    public string OwnerEmail { get; set; }

    public string AccountId { get; set; }
}
