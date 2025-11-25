using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Controllers.EmploymentContract.Models;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.EmploymentContract.Services.Interfaces;
using DocuSign.Workspaces.Infrastructure.Models;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.EmploymentContract
{
    [Authorize]
    public class EmploymentContractController : Controller
    {
        private readonly IEmploymentContractEnvelopeService _envelopeService;
        private readonly IAccountRepository _accountRepository;
        private readonly IEventsRepository _eventsRepository;

        public EmploymentContractController(
            IEmploymentContractEnvelopeService envelopeService,
            IAccountRepository accountRepository,
            IEventsRepository eventsRepository)
        {
            _envelopeService = envelopeService;
            _accountRepository = accountRepository;
            _eventsRepository = eventsRepository;
        }

        [HttpPost]
        [Route("/api/envelopes/employment-contract")]
        public IActionResult CreateEmploymentContractEnvelope([FromBody] RequestEmploymentContractEnvelopeModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid model");
            }

            CreateEnvelopeResponse createEnvelopeResponse =
                _envelopeService.CreateEmploymentContractEnvelop(
                        model.EnvelopeAction,
                        model.Template,
                        _accountRepository.AccountId,
                        model.RedirectUrl,
                        new SignerInfo
                        {
                            Email = model.SignerInfo.Email,
                            FullName = $"{model.SignerInfo.FirstName} {model.SignerInfo.LastName}"
                        },
                        new SignatureInfo
                        {
                            ProviderName = model.SignatureInfo.SignatureType,
                            AccessCode = model.SignatureInfo.AccessCode
                        });

            _eventsRepository.SaveEnvelope(
                _accountRepository.AccessToken,
                createEnvelopeResponse.EnvelopeId,
                UseCaseTypes.EmploymentContract);

            return Ok(new ResponseEnvelopeModel
            {
                RedirectUrl = createEnvelopeResponse.RedirectUrl,
                EnvelopeId = createEnvelopeResponse.EnvelopeId
            });
        }
    }
}