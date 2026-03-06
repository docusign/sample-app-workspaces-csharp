using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.eSign.Client;
using DocuSign.Workspaces.Domain.CarePlans;
using DocuSign.Workspaces.Domain.CarePlans.Model;
using DocuSign.Workspaces.Infrastructure.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.CarePlans;

public class CarePlansController(ICarePlansService carePlansService) : Controller
{
    [HttpGet]
    [Route("/api/care-plans/physicians")]
    public async Task<IActionResult> GetPhysicians()
    {
        try
        {
            var physicians = await carePlansService.GetPhysician();
            return Ok(physicians);
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
    [Route("/api/care-plans/submit-physician")]
    public async Task<IActionResult> SubmitToPhysician([FromBody] SubmitToPhysiciansModel model)
    {
        try
        {
            var documents = await carePlansService.SubmitToPhysician(model);
            return Ok(documents);
        }
        catch (ApplicationApiException ex)
        {
            var message = ex.Details?.ErrorDescription ?? ex.Details?.Error ?? ex.Message;
            return BadRequest(message);
        }
        catch (Docusign.IAM.SDK.Models.Errors.APIException ex)
        {
            return StatusCode(500, ex.StatusCode == 429 ?
                "The request limit for adding users to a workspace (4 per day) has been reached." :
                ex.Message);
        }
        catch (Exception ex)
        {
            var tp = ex.GetType().ToString();
            return StatusCode(500, ex.Message);
        }
    }
}
