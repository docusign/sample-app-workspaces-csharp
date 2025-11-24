using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Workspaces;
using DocuSign.Workspaces.Domain.Workspaces.Models;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.Workspaces;

public class WorkspacesController(IWorkspacesService workspacesService) : Controller
{
    [HttpGet]
    [Route("/api/workspaces/tryhack")]
    public async Task<IActionResult> TryHack()
    {
        var workspace = new CreateWorkspacesModel()
        {
            AccountId = "8a1318df-e2d3-48af-ae26-27fa85fe80e9",
            OwnerEmail = "test@mail.com",
            WorkspacesName = "testWorkspace"
        };
        await workspacesService.CreateWorkspaces(workspace);
        return Ok();
    }
}
