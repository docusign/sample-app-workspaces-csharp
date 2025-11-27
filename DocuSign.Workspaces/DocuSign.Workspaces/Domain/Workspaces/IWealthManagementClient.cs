using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Workspaces.Models;

namespace DocuSign.Workspaces.Domain.Workspaces;

public interface IWealthManagementClient
{
    Task<string> CreateWorkspaces(CreateWorkspacesModel createWorkspacesModel);

    Task<List<EnvelopeModel>> AddSelectedDocumentsForClientPackage(WorkspaceAddDocumentsModel createModel);
}
