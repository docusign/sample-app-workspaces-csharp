using DocuSign.Workspaces.Controllers.Common.Models;
using DocuSign.Workspaces.Controllers.CustomQuote.Models;
using DocuSign.Workspaces.Domain.Common.Models;
using DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces;
using DocuSign.Workspaces.Domain.CustomQuote.Services.Interfaces;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DocuSign.Workspaces.Controllers.CustomQuote
{
    [Authorize]
    public class CustomQuoteController : Controller
    {
        private readonly ICustomQuoteEnvelopeService _envelopeService;
        private readonly IAccountRepository _accountRepository;
        private readonly ICustomerProfileRepository _customerProfileRepository;
        private readonly IEventsRepository _eventsRepository;

        public CustomQuoteController(
            ICustomQuoteEnvelopeService envelopeService,
            IAccountRepository accountRepository,
            IEventsRepository eventsRepository,
            ICustomerProfileRepository customerProfileRepository)
        {
            _envelopeService = envelopeService;
            _accountRepository = accountRepository;
            _eventsRepository = eventsRepository;
            _customerProfileRepository = customerProfileRepository;
        }

        [HttpPost]
        [Route("/api/envelopes/custom-quote")]
        public IActionResult CreateCustomQuoteEnvelope([FromBody] RequestCustomQuoteEnvelopeModel model)
        {
            if (model == null)
            {
                return BadRequest("Invalid model");
            }

            CreateEnvelopeResponse createEnvelopeResponse =
                _envelopeService.CreateCustomQuoteEnvelop(
                        _accountRepository.AccountId,
                        new SignerInfo
                        {
                            FullName = $"{model.FirstName} {model.LastName}",
                            CountryCode = model.CountryCode,
                            PhoneNumber = model.PhoneNumber,
                        });

            _eventsRepository.SaveEnvelope(
                _accountRepository.AccessToken,
                createEnvelopeResponse.EnvelopeId,
                UseCaseTypes.CustomQuote);

            return Ok(new ResponseEnvelopeModel
            {
                RedirectUrl = createEnvelopeResponse.RedirectUrl,
                EnvelopeId = createEnvelopeResponse.EnvelopeId
            });
        }
    }
}