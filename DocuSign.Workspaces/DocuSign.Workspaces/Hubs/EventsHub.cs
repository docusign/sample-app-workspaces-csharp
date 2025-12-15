using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Hubs
{
    public class EventsHub : Hub
    {
        private readonly IEventsRepository _eventsRepository;

        public EventsHub(IEventsRepository eventsRepository)
        {
            _eventsRepository = eventsRepository;
        }

        public override async Task OnConnectedAsync()
        {
            var accessToken = Context.User.FindFirst("access_token").Value;
            _eventsRepository.SaveReceiver(accessToken, Context.ConnectionId);
            await base.OnConnectedAsync();
        }
    }
}
