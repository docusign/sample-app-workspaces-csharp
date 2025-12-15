using System.Collections.Generic;
using DocuSign.eSign.Model;

namespace DocuSign.Workspaces.Domain;

public static class EventService
{
    public static List<EventNotification> ConfigureEventNotifications(string eventNotificationUrl)
    {
        return
        [
            new EventNotification()
            {
                Url = eventNotificationUrl,
                DeliveryMode = "SIM",
                RequireAcknowledgment = "true",
                LoggingEnabled = "true",
                Events = new List<string>
                {
                    "envelope-created",
                    "envelope-sent",
                    "envelope-completed",
                    "envelope-declined",
                    "envelope-voided",
                },
                EventData = new ConnectEventData
                {
                    Version = "restv2.1",
                    Format = "json",
                    IncludeData =
                    [
                        "recipients",
                        "tabs"
                    ]
                },
            }
        ];
    }
}
