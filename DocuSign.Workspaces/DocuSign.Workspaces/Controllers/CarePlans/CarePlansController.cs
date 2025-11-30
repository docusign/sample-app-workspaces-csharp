using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.CarePlans;
using DocuSign.Workspaces.Domain.CarePlans.Model;
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
    public async Task<List<CareDocumentsModel>> SubmitToPhysician([FromBody] SubmitToPhysiciansModel model)
    {
        var documents = await carePlansService.SubmitToPhysician(model);
        return documents;
    }
}
