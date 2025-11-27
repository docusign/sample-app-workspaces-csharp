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
        var bytes = await System.IO.File.ReadAllBytesAsync("./Docs/World_Wide_Corp_lorem.pdf");
        model.Documents = [
            new Document(){Base64String = Convert.ToBase64String(bytes), Name = "Test1"},
            new Document(){Base64String = Convert.ToBase64String(bytes), Name = "Test2"}];

        var envelopes = await wealthManagementClient.AddSelectedDocumentsForClientPackage(model);
        return envelopes;
    }
}
