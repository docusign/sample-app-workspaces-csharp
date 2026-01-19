using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using DocuSign.eSign.Model;
using Docusign.IAM.SDK.Models.Components;
using DocuSign.Workspaces.Domain.Workspaces.Models;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Document = DocuSign.Workspaces.Domain.Workspaces.Models.Document;

namespace DocuSign.Workspaces.Domain.Workspaces;

public class WealthManagementClient(
    IDocuSignApiProvider docuSignApiProvider,
    IAppConfiguration appConfiguration,
    IAccountRepository accountRepository)
    : IWealthManagementClient
{
    public async Task<string> CreateWorkspaces(CreateWorkspacesModel createWorkspacesModel)
    {
        var workspaceBody = new CreateWorkspaceBody
        {
            Name = createWorkspacesModel.WorkspacesName,
        };
        var workspace = await docuSignApiProvider.Workspace2.CreateWorkspaceAsync(accountRepository.AccountId, workspaceBody);

        return workspace.WorkspaceId;
    }

    public async Task<List<EnvelopeModel>> AddSelectedDocumentsForClientPackage(WorkspaceAddDocumentsModel createModel)
    {
        var envelopes = new List<EnvelopeModel>();
        foreach (var document in createModel.Documents)
        {
            var envelopeId = await ProcessDocument(createModel, document.Name);

            var envelopeModel = await UpdateEachEnvelopWithDocument(
                envelopeId: envelopeId,
                document: document,
                model: createModel);

            envelopes.Add(envelopeModel);
        }

        return envelopes;
    }

    private async Task<string> ProcessDocument(WorkspaceAddDocumentsModel createModel, string envelopeName)
    {
        var workspace = await docuSignApiProvider.Workspace2.GetWorkspaceAsync(accountRepository.AccountId, createModel.WorkspaceId);

        var workspaceEnvelopeForCreate = new WorkspaceEnvelopeForCreate
        {
            EnvelopeName = envelopeName
        };

        var envelopeResponse = await docuSignApiProvider.Workspace2.CreateWorkspaceEnvelopeAsync(
            accountRepository.AccountId,
            createModel.WorkspaceId,
            workspaceEnvelopeForCreate);

        var uploadRequestBody = new CreateWorkspaceUploadRequestBody
        {
            Name = envelopeName + " Upload " + Guid.NewGuid(),
            Description = "Description Test",
            DueDate = DateTime.Now,
            Status = WorkspaceUploadRequestStatus.Draft,
            Assignments =
            [
                new CreateWorkspaceUploadRequestAssignment
                {
                    Email = createModel.PrimaryOwnerEmail,
                    FirstName = createModel.PrimaryOwnerFirstName,
                    LastName = createModel.PrimaryOwnerLastName,
                    UploadRequestResponsibilityTypeId = WorkspaceUploadRequestResponsibilityType.Assignee
                },
                new CreateWorkspaceUploadRequestAssignment
                {
                    AssigneeUserId = workspace.CreatedByUserId,
                    UploadRequestResponsibilityTypeId = WorkspaceUploadRequestResponsibilityType.Watcher
                }
            ]
        };
        await docuSignApiProvider.WorkspaceUploadRequest.CreateWorkspaceUploadRequestAsync(
            accountRepository.AccountId,
            createModel.WorkspaceId,
            uploadRequestBody);

        return envelopeResponse.EnvelopeId;
    }

    private async Task<EnvelopeModel> UpdateEachEnvelopWithDocument(string envelopeId, Document document, WorkspaceAddDocumentsModel model)
    {
        var accountsApi = new AccountsApi(docuSignApiProvider.ApiClient);
        var response = await accountsApi.GetAccountIdentityVerificationAsync(accountRepository.AccountId);

        var workflow = response.IdentityVerification.FirstOrDefault();
        if (workflow == null)
        {
            throw new ApiException(0, "IDENTITY_WORKFLOW_INVALID_ID");
        }

        var workflowId = workflow.WorkflowId;
        var eventNotificationUrl = $"{appConfiguration.DocuSign.EventNotificationBaseUrl}/api/callback/event";

        var env = new EnvelopeDefinition
        {
            EnvelopeIdStamping = "true",
            EmailSubject = "Please Sign",
            EmailBlurb = "Sample text for email body",
            Status = "Sent",
            EventNotifications = EventService.ConfigureEventNotifications(eventNotificationUrl)
        };

        var doc1 = new eSign.Model.Document
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

        var recipientIdentityVerification = new RecipientIdentityVerification
        {
            WorkflowId = workflowId
        };

        var recipients = new Recipients
        {
            Signers =
            [
                new Signer
                {
                    Name = model.PrimaryOwnerFirstName + " " + model.PrimaryOwnerLastName,
                    Email = model.PrimaryOwnerEmail,
                    RoutingOrder = "1",
                    Status = "Created",
                    DeliveryMethod = "Email",
                    RecipientId = "1",
                    Tabs = signer1Tabs,
                    IdentityVerification = recipientIdentityVerification,
                }
            ]
        };

        if (!string.IsNullOrEmpty(model.SecondaryOwnerEmail))
        {
           recipients.Signers.Add(new Signer
            {
                Name = model.PrimaryOwnerFirstName + " " + model.PrimaryOwnerLastName,
                Email = model.PrimaryOwnerEmail,
                RoutingOrder = "1",
                Status = "Created",
                DeliveryMethod = "Email",
                RecipientId = "2",
                Tabs = signer1Tabs,
                IdentityVerification = recipientIdentityVerification,
            });
        }

        env.Recipients = recipients;
        await docuSignApiProvider.EnvelopApi.UpdateDocumentsAsync(accountRepository.AccountId, envelopeId, env);

        var envelope = new Envelope
        {
            Recipients = recipients,
            Status = "Sent"
        };

        await docuSignApiProvider.EnvelopApi.UpdateAsync(accountRepository.AccountId, envelopeId, envelope);

        return new EnvelopeModel(document.Name, env.Status);
    }
}
