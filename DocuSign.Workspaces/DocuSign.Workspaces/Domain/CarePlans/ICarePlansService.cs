using System.Collections.Generic;
using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.CarePlans.Model;

namespace DocuSign.Workspaces.Domain.CarePlans;

public interface ICarePlansService
{
    Task<List<PhysicianModel>> GetPhysician();

    Task<List<CareDocumentsModel>> SubmitToPhysician(SubmitToPhysiciansModel model);
}
