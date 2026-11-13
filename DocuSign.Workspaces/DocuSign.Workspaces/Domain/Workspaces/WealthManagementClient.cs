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
        try
        {
            var workspaceBody = new CreateWorkspaceBody
            {
                Name = createWorkspacesModel.WorkspacesName,
            };
            var workspace = await docuSignApiProvider.Workspace2.CreateWorkspaceAsync(accountRepository.AccountId, workspaceBody);

            return workspace.WorkspaceId;
        }
        catch (Exception e)
        {
            throw;
        }
    }

    public async Task<List<ResponseWealthManagementModel>> HandleDocuments(HandleDocumentsModel createModel)
    {
        var response = new List<ResponseWealthManagementModel>();
        foreach (var document in createModel.Documents)
        {
            if (!document.IsForSignature)
            {
                await ProcessUploadRequest(createModel, document);
                response.Add(new ResponseWealthManagementModel(document.Name, "Created upload request"));
            }
            else
            {
                var documentId = await UploadWorkspaceDocument(document, createModel.WorkspaceId);
                await UpdateEachEnvelopWithDocument(document, createModel, documentId);
                response.Add(new ResponseWealthManagementModel(document.Name, "Envelope sent"));
            }
        }

        return response;
    }

    private async Task<string> UploadWorkspaceDocument(Document document, string workspaceId)
    {
        var documentRequest = new AddWorkspaceDocumentRequest
        {
            File = new AddWorkspaceDocumentRequestFile
            {
                Content = Convert.FromBase64String(document.Base64String),
                FileName = document.Name
            }
        };
        var addedDocument = await docuSignApiProvider.WorkspaceDocuments.AddWorkspaceDocumentAsync(accountRepository.AccountId, workspaceId, documentRequest);

        return addedDocument.DocumentId;
    }

    private async Task ProcessUploadRequest(HandleDocumentsModel createModel, Document document)
    {
        var workspace = await docuSignApiProvider.Workspace2.GetWorkspaceAsync(accountRepository.AccountId, createModel.WorkspaceId);
        var uploadRequestBody = new CreateWorkspaceUploadRequestBody
        {
            Name = document.Name + " Upload " + Guid.NewGuid(),
            Description = "Description Test",
            DueDate = DateTime.Now.AddDays(7),
            Status = WorkspaceUploadRequestStatus.InProgress,
            Assignments =
            [
                new CreateWorkspaceUploadRequestAssignment
                {
                    Email = createModel.PrimaryOwnerEmail,
                    FirstName = createModel.PrimaryOwnerFirstName,
                    LastName = createModel.PrimaryOwnerLastName,
                    UploadRequestResponsibilityTypeId = WorkspaceUploadRequestResponsibilityType.Assignee,
                    AssigneeUserId = workspace.CreatedByUserId
                }
            ]
        };

        await docuSignApiProvider.WorkspaceUploadRequest.CreateWorkspaceUploadRequestAsync(
            accountRepository.AccountId,
            createModel.WorkspaceId,
            uploadRequestBody);
    }

    private async Task UpdateEachEnvelopWithDocument(Document document, HandleDocumentsModel model, string documentId)
    {
        var workspaceEnvelopeForCreate = new WorkspaceEnvelopeForCreate
        {
            EnvelopeName = document.Name,
            DocumentIds = [documentId]
        };

        var envelopeResponse = await docuSignApiProvider.Workspace2.CreateWorkspaceEnvelopeAsync(
            accountRepository.AccountId,
            model.WorkspaceId,
            workspaceEnvelopeForCreate);

        var eventNotificationUrl = $"{appConfiguration.DocuSign.EventNotificationBaseUrl}/api/callback/event";

        var envelope = new Envelope
        {
            EnvelopeIdStamping = "true",
            EmailSubject = "Please Sign",
            EmailBlurb = "Sample text for email body",
            Recipients = await GetRecipientsAsync(model),
            Status = "Sent"
        };

        await docuSignApiProvider.EnvelopApi.UpdateAsync(accountRepository.AccountId, envelopeResponse.EnvelopeId, envelope);
    }

    private async Task<Recipients> GetRecipientsAsync(HandleDocumentsModel model)
    {
        var accountsApi = new AccountsApi(docuSignApiProvider.ApiClient);
        RecipientIdentityVerification recipientIdentityVerification = null!;
        if (appConfiguration.DocuSign.TestAccountConnectionSettings.AccountId == accountRepository.AccountId)
        {
            var response = await accountsApi.GetAccountIdentityVerificationAsync(accountRepository.AccountId);
            var workflow = response.IdentityVerification.FirstOrDefault(a => a.WorkflowLabel == "IDV (Standard)");
            if (workflow == null)
            {
                throw new ApiException(0, "IDENTITY_WORKFLOW_INVALID_ID");
            }

            var workflowId = workflow.WorkflowId;

            recipientIdentityVerification = new RecipientIdentityVerification
            {
                WorkflowId = workflowId
            };
        }

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
                    IdentityVerification = recipientIdentityVerification
                }
            ]
        };

        if (!string.IsNullOrEmpty(model.SecondaryOwnerEmail))
        {
            var signHere2 = new SignHere
            {
                AnchorString = "/sn2/",
                AnchorUnits = "pixels",
                AnchorXOffset = "30",
                AnchorYOffset = "40"
            };

            var signer2Tabs = new Tabs
            {
                SignHereTabs = [signHere2]
            };

            recipients.Signers.Add(new Signer
            {
                Name = model.SecondaryOwnerFirstName + " " + model.SecondaryOwnerLastName,
                Email = model.SecondaryOwnerEmail,
                RoutingOrder = "1",
                Status = "Created",
                DeliveryMethod = "Email",
                RecipientId = "2",
                Tabs = signer2Tabs,
                IdentityVerification = recipientIdentityVerification
            });
        }

        return recipients;
    }
}
