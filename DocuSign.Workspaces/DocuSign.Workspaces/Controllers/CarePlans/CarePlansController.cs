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
    public async Task<List<PhysicianModel>> GetPhysicians()
    {
        var physicians = await carePlansService.GetPhysician();
        return physicians;
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
