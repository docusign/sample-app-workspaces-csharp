using DocuSign.Workspaces.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Linq;
using System.Threading.Tasks;
using DocuSign.Workspaces.Controllers.Events.Models;
using DocuSign.Workspaces.Infrastructure.Models;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Controllers.Events
{
    public class DocuSignEventsController : Controller
    {
        private readonly IHubContext<EventsHub> _hubContext;
        private readonly IEventsRepository _eventsRepository;

        public DocuSignEventsController(IHubContext<EventsHub> hubContext, IEventsRepository eventsRepository)
        {
            _hubContext = hubContext;
            _eventsRepository = eventsRepository;
        }

        [Route("/api/callback/event")]
        [HttpGet]
        public async Task<IActionResult> ReceiveEvent([FromBody] DocuSignEventModel docusignEvent)
        {
            string evnvelopId = docusignEvent?.Data?.EnvelopeId;
            if (_eventsRepository.IsEnvelopRegistered(evnvelopId))
            {
                (string connectionId, string useCaseType) = _eventsRepository.GetEnvelopDetails(evnvelopId);
                var eventModel = CreateEventModel(useCaseType, docusignEvent);
                await _hubContext.Clients.Client(connectionId).SendAsync("ReceivedEvent", eventModel);
            }

            return Ok();
        }

        private EventModel CreateEventModel(string useCaseType, DocuSignEventModel docusignEvent)
        {
            var eventModel = new EventModel
            {
                UseCase = useCaseType,
                Event = docusignEvent.Event,
                Date = docusignEvent.GeneratedDateTime,
                Signer = new SignerModel
                {
                    Name = docusignEvent.Data.EnvelopeSummary.Recipients.Signers[0].Name,
                    Email = docusignEvent.Data.EnvelopeSummary.Recipients.Signers[0].Email,
                    Tabs = docusignEvent.Data.EnvelopeSummary.Recipients.Signers[0].Tabs.TextTabs?.Select(
                        x => new DataSourceItem
                        {
                            Key = x.TabLabel,
                            Value = x.Value,
                        })
                }
            };

            return eventModel;
        }
    }
}
