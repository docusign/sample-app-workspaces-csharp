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
        var envelopes = await wealthManagementClient.AddSelectedDocumentsForClientPackage(model);
        return envelopes;
    }
}
