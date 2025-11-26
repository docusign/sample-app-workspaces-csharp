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
using Document = DocuSign.eSign.Model.Document;

namespace DocuSign.Workspaces.Domain.Workspaces;

public class WealthManagementClient(IDocuSignApiProvider docuSignApiProvider) : IWealthManagementClient
{
    public async Task<string> CreateWorkspaces(CreateWorkspacesModel createWorkspacesModel)
    {
        var workspaceBody = new CreateWorkspaceBody
        {
            Name = "Test Workspace"
        };

        var workspace = await docuSignApiProvider.Workspace2.CreateWorkspaceAsync(createWorkspacesModel.AccountId, workspaceBody);

        return workspace.WorkspaceId;
    }

    public async Task<List<EnvelopeModel>> AddSelectedDocumentsForClientPackage(WorkspaceAddDocumentsModel createModel)
    {
        var envelopes = new List<EnvelopeModel>();
        foreach (var document in createModel.Documents)
        {
            var envelopeId = await ProcessDocument(createModel);

            var envelopeModel = await UpdateEachEnvelopWithDocument(
                accountId: createModel.AccountId,
                envelopeId: envelopeId,
                documentBytes: Convert.FromBase64String(document));

            envelopes.Add(envelopeModel);
        }

        return envelopes;
    }

    private async Task<string> ProcessDocument(WorkspaceAddDocumentsModel createModel)
    {
        var workspaceEnvelopeForCreate = new WorkspaceEnvelopeForCreate
        {
            EnvelopeName = "Test Envelope"
        };

        var workspace = await docuSignApiProvider.Workspace2.GetWorkspaceAsync(createModel.AccountId, createModel.WorkspaceId);

        var envelopeResponse = await docuSignApiProvider.Workspace2.CreateWorkspaceEnvelopeAsync(
            createModel.AccountId,
            createModel.WorkspaceId,
            workspaceEnvelopeForCreate);

        var uploadRequestBody = new CreateWorkspaceUploadRequestBody
        {
            Name = "Test upload",
            Description = "Description Test",
            DueDate = DateTime.Now,
            Status = WorkspaceUploadRequestStatus.Draft,
            Assignments =
            [
                new CreateWorkspaceUploadRequestAssignment
                {
                    Email = "test@mail.com",
                    FirstName = "FirstName",
                    LastName = "LastName",
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
            createModel.AccountId,
            createModel.WorkspaceId,
            uploadRequestBody);

        return envelopeResponse.EnvelopeId;
    }

    private async Task<EnvelopeModel> UpdateEachEnvelopWithDocument(string accountId, string envelopeId, byte[] documentBytes)
    {
        var accountsApi = new AccountsApi(docuSignApiProvider.ApiClient);
        var response = await accountsApi.GetAccountIdentityVerificationAsync(accountId);

        var workflow = response.IdentityVerification.FirstOrDefault();
        if (workflow == null)
        {
            throw new ApiException(0, "IDENTITY_WORKFLOW_INVALID_ID");
        }

        var workflowId = workflow.WorkflowId;

        var env = new EnvelopeDefinition
        {
            EnvelopeIdStamping = "true",
            EmailSubject = "Please Sign",
            EmailBlurb = "Sample text for email body",
            Status = "Sent",
        };

        var doc1 = new Document
        {
            DocumentId = "1",
            Name = "Lorem",
            DocumentBase64 = Convert.ToBase64String(documentBytes),
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
            WorkflowId = workflowId,
            InputOptions =
            [
                new RecipientIdentityInputOption
                {
                    Name = "phone_number_list",
                    ValueType = "PhoneNumberList",
                    PhoneNumberList =
                    [
                        new RecipientIdentityPhoneNumber
                        {
                            Number = "111888222",
                            CountryCode = "+380",
                        }
                    ],
                }
            ],
        };

        var signer1 = new Signer
        {
            Name = "signerName",
            Email = "signerEmail@mail.com",
            RoutingOrder = "1",
            Status = "Created",
            DeliveryMethod = "Email",
            RecipientId = "1",
            Tabs = signer1Tabs,
            IdentityVerification = recipientIdentityVerification,
        };

        var recipients = new Recipients
        {
            Signers = [signer1]
        };
        env.Recipients = recipients;

        await docuSignApiProvider.EnvelopApi.UpdateDocumentsAsync(accountId, envelopeId, env);

        return new EnvelopeModel(envelopeId, env.Status);
    }
}
