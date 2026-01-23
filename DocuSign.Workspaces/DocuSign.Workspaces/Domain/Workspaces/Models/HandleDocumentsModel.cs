using System.Collections.Generic;

namespace DocuSign.Workspaces.Domain.Workspaces.Models;

public class HandleDocumentsModel
{
    public string WorkspaceId { get; set; }
    public List<Document> Documents { get; set; }
    public string PrimaryOwnerFirstName { get; set; }
    public string PrimaryOwnerLastName { get; set; }
    public string PrimaryOwnerEmail { get; set; }
    public string SecondaryOwnerFirstName { get; set; }
    public string SecondaryOwnerLastName { get; set; }
    public string SecondaryOwnerEmail { get; set; }
}

public class Document
{
    public string Base64String { get; set; }
    public string Name { get; set; }
    public bool IsForSignature { get; set; }
}
