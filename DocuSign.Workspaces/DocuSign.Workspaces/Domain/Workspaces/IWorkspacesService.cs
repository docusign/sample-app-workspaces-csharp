using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Workspaces.Models;

namespace DocuSign.Workspaces.Domain.Workspaces;

public interface IWorkspacesService
{
    Task CreateWorkspaces(CreateWorkspacesModel createWorkspacesModel);
}
