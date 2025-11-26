using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Workspaces;
using DocuSign.Workspaces.Domain.Workspaces.Models;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.WealthManagement;

public class WealthManagementClientController(IWealthManagementClient wealthManagementClient) : Controller
{
    [HttpPost]
    [Route("/api/workspaces/create")]
    public async Task<string> CreateWorkspaces([FromBody] CreateWorkspacesModel workspacesModel)
    {
        var workspaceId = await wealthManagementClient.CreateWorkspaces(workspacesModel);
        return workspaceId;
    }

    [HttpPost]
    [Route("/api/workspaces/add-selected-documents")]
    public async Task<List<EnvelopeModel>> AddSelectedDocuments([FromBody] WorkspaceAddDocumentsModel model)
    {
        // var workspaceId = await wealthManager.CreateWorkspaces(new CreateWorkspacesModel()
        // {
        //     AccountId = "8a1318df-e2d3-48af-ae26-27fa85fe80e9",
        //     OwnerEmail = "test@mail.com",
        //     WorkspacesName = "test_workspace"
        // });
        var bytes = await System.IO.File.ReadAllBytesAsync("./Docs/World_Wide_Corp_lorem.pdf");
        var documents = new List<string>
        {
            Convert.ToBase64String(bytes)
        };

        model.Documents = documents;
        //
        // var model = new WorkspaceAddDocumentsModel(
        //     "4b6e3378-2fda-498b-86e7-55513966f05a",
        //     "workspaceId",
        //     documents);
        var envelopes = await wealthManagementClient.AddSelectedDocumentsForClientPackage(model);
        return envelopes;
    }
}
