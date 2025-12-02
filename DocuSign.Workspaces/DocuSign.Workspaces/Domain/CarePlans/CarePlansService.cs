using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using DocuSign.eSign.Api;
using DocuSign.eSign.Model;
using Docusign.IAM.SDK.Models.Components;
using DocuSign.Workspaces.Domain.CarePlans.Model;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Domain.CarePlans;

public class CarePlansService(IDocuSignApiProvider docuSignApiProvider, IAppConfiguration appConfiguration, IAccountRepository accountRepository)
    : ICarePlansService
{
    public async Task<List<PhysicianModel>> GetPhysician()
    {
        var physiciansWorkspaces = new List<PhysicianModel>();
        if (appConfiguration.DocuSign.TestAccountConnectionSettings.AccountId == accountRepository.AccountId)
        {
            List<string> physicians = ["Dr. Max PayneNan", "Dr. Angela KerrNan", "Dr. Luke HeerNan"];
            var workspaces = await docuSignApiProvider.Workspace2.GetWorkspacesAsync(accountRepository.AccountId);
            if (workspaces.Workspaces != null || workspaces.Workspaces?.Count != 0)
            {
                var physician = workspaces.Workspaces
                    ?.Where(a => physicians.Contains(a.Name + " Workspace"))
                    .Select(a => new PhysicianModel
                    {
                        Name = a.Name,
                        WorkspaceId = a.WorkspaceId
                    }).ToList();

                if (physician?.Count == physicians.Count)
                {
                    return physician;
                }
            }

            foreach (var physician in physicians)
            {
                var workspaceBody = new CreateWorkspaceBody
                {
                    Name = physician + " Workspace"
                };
                var workspace = await docuSignApiProvider.Workspace2.CreateWorkspaceAsync(accountRepository.AccountId, workspaceBody);
                physiciansWorkspaces.Add(new PhysicianModel
                {
                    Name = physician,
                    WorkspaceId = workspace.WorkspaceId
                });
            }
        }
        else
        {
            var workspaceBody = new CreateWorkspaceBody
            {
                Name = accountRepository.AccountName + " Workspace"
            };
            var workspace = await docuSignApiProvider.Workspace2.CreateWorkspaceAsync(accountRepository.AccountId, workspaceBody);
            physiciansWorkspaces.Add(new PhysicianModel
            {
                Name = accountRepository.AccountName,
                WorkspaceId = workspace.WorkspaceId
            });
        }

        return physiciansWorkspaces;
    }

    public async Task<List<CareDocumentsModel>> SubmitToPhysician(SubmitToPhysiciansModel model)
    {
        const string sentStatus = "sent";
        var documents = new List<CareDocumentsModel>();
        foreach (var document in model.Documents)
        {
            if (document.IsForSignature)
            {
                var workspaceEnvelopeForCreate = new WorkspaceEnvelopeForCreate
                {
                    EnvelopeName = document.Name
                };

                var envelopeResponse = await docuSignApiProvider.Workspace2.CreateWorkspaceEnvelopeAsync(
                    accountRepository.AccountId,
                    model.Physician.WorkspaceId,
                    workspaceEnvelopeForCreate);

                var eventNotificationUrl = $"{appConfiguration.DocuSign.EventNotificationBaseUrl}/api/callback/event";

                var env = new EnvelopeDefinition
                {
                    EmailSubject = "Please Sign",
                    EmailBlurb = "Sample text for email body",
                    Status = sentStatus,
                    EventNotifications = EventService.ConfigureEventNotifications(eventNotificationUrl)
                };

                var doc1 = new Document
                {
                    DocumentId = "1",
                    Name = document.Name,
                    DocumentBase64 = document.Base64String
                };

                env.Documents = [doc1];

                var signHere1 = new SignHere
                {
                    AnchorString = "/sn1/",
                    AnchorUnits = "pixels",
                    AnchorXOffset = "10",
                    AnchorYOffset = "20",
                };

                var signer1Tabs = new Tabs
                {
                    SignHereTabs = [signHere1],
                };

                var signer1 = new Signer
                {
                    Name = "BohdanMoroz",
                    Email = "bohdan.moroz@sigma.software",
                    RecipientId = "1",
                    Status = sentStatus,
                    Tabs = signer1Tabs
                };

                var recipients = new Recipients
                {
                    Signers = [signer1]
                };

                await docuSignApiProvider.EnvelopApi.UpdateRecipientsAsync(accountRepository.AccountId, envelopeResponse.EnvelopeId, recipients);

                await docuSignApiProvider.EnvelopApi.UpdateDocumentsAsync(accountRepository.AccountId, envelopeResponse.EnvelopeId, env);

                try
                {

                    await docuSignApiProvider.EnvelopApi.UpdateAsync(accountRepository.AccountId, envelopeResponse.EnvelopeId,
                        new Envelope(Status: sentStatus, NotificationUri: eventNotificationUrl));

                    var sd = await docuSignApiProvider.EnvelopApi.ListAuditEventsAsync(accountRepository.AccountId, envelopeResponse.EnvelopeId);
                    var hg = sd;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }

                documents.Add(new CareDocumentsModel(document.Name, document.IsForSignature, sentStatus));
            }
            else
            {
                var documentRequest = new AddWorkspaceDocumentRequest
                {
                    File = new AddWorkspaceDocumentRequestFile
                    {
                        Content = Convert.FromBase64String(document.Base64String),
                        FileName = document.Name
                    }
                };
                await docuSignApiProvider.WorkspaceDocuments.AddWorkspaceDocumentAsync(accountRepository.AccountId, model.Physician.WorkspaceId, documentRequest);

                var userForCreate = new WorkspaceUserForCreate
                {
                    Email = model.Email,
                    FirstName = model.Physician.Name,
                    LastName = ""
                };
                await docuSignApiProvider.WorkspaceUsers.AddWorkspaceUserAsync(accountRepository.AccountId, model.Physician.WorkspaceId, userForCreate);

                documents.Add(new CareDocumentsModel(document.Name, document.IsForSignature, string.Empty));
            }
        }

        return documents;
    }
}
