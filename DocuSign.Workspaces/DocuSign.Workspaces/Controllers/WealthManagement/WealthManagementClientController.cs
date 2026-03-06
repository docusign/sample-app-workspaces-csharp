using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Workspaces;
using DocuSign.Workspaces.Domain.Workspaces.Models;
using DocuSign.Workspaces.Infrastructure.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.WealthManagement;

public class WealthManagementClientController(IWealthManagementClient wealthManagementClient) : Controller
{
    [HttpPost]
    [Route("/api/workspaces/create")]
    public async Task<IActionResult> CreateWorkspaces([FromBody] CreateWorkspacesModel workspacesModel)
    {
        try
        {
            var workspaceId = await wealthManagementClient.CreateWorkspaces(workspacesModel);
            return Ok(workspaceId);
        }
        catch (ApplicationApiException ex)
        {
            var message = ex.Details?.ErrorDescription ?? ex.Details?.Error ?? ex.Message;
            return BadRequest(message);
        }
        catch (Docusign.IAM.SDK.Models.Errors.ErrorDetails e)
        {
            return e.StatusCode == 401 ?
                BadRequest("Please check that the default account has access to the workspaces.") :
                BadRequest(e.Message);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost]
    [Route("/api/workspaces/add-selected-documents")]
    public async Task<IActionResult> AddSelectedDocuments([FromBody] HandleDocumentsModel model)
    {
        try
        {
            var envelopes = await wealthManagementClient.HandleDocuments(model);
            return Ok(envelopes);
        }
        catch (ApplicationApiException ex)
        {
            var message = ex.Details?.ErrorDescription ?? ex.Details?.Error ?? ex.Message;
            return BadRequest(message);
        }
        catch (Docusign.IAM.SDK.Models.Errors.ErrorDetails e)
        {
            return BadRequest(e.Message);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}
