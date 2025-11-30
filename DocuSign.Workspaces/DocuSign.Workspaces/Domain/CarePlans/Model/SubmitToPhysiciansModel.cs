using System.Collections.Generic;

namespace DocuSign.Workspaces.Domain.CarePlans.Model;

public class SubmitToPhysiciansModel
{
    public string Email { get; set; }
    public IList<Document1> Documents { get; set; }
    public PhysicianModel Physician { get; set; }
}

public class Document1
{
    public string Base64String { get; set; }
    public string Name { get; set; }
    public bool IsForSignature { get; set; }
}

