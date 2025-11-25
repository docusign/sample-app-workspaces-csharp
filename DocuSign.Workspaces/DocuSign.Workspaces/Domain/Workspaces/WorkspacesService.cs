using System;
using System.Threading.Tasks;
using DocuSign.eSign.Model;
using DocuSign.Workspaces.Domain.Workspaces.Models;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Domain.Workspaces;

public class WorkspacesService(IDocuSignApiProvider docuSignApiProvider) : IWorkspacesService
{
    public async Task CreateWorkspaces(CreateWorkspacesModel createWorkspacesModel)
    {
        var workspaceUser = new WorkspaceUser(
            AccountId: createWorkspacesModel.AccountId,
            Email: createWorkspacesModel.OwnerEmail);

        var workspaces = new Workspace(
            WorkspaceName: createWorkspacesModel.WorkspacesName,
            CallerInformation: workspaceUser);
        try
        {
            var workspace = await docuSignApiProvider.WorkspacesApi.CreateWorkspaceAsync(createWorkspacesModel.AccountId, workspaces);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
        var dd = 0;
    }
}
