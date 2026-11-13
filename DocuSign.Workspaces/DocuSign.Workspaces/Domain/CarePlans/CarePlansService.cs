using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using DocuSign.eSign.Model;
using Docusign.IAM.SDK.Models.Components;
using DocuSign.Workspaces.Domain.CarePlans.Model;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.Extensions.Logging;

namespace DocuSign.Workspaces.Domain.CarePlans;

public class CarePlansService(
    IDocuSignApiProvider docuSignApiProvider,
    IAppConfiguration appConfiguration,
    IAccountRepository accountRepository,
    ILogger<CarePlansService> logger)
    : ICarePlansService
{
    public async Task<List<PhysicianModel>> GetPhysician()
    {
        var physiciansWorkspaces = new List<PhysicianModel>();

        List<string> physicians = ["Max Payne", "Angela Kerr", "Luke Heer"];
        var workspaces = await ExecuteDocuSignCallAsync(
            "Workspace2.GetWorkspacesAsync",
            new { accountRepository.AccountId },
            () => docuSignApiProvider.Workspace2.GetWorkspacesAsync(accountRepository.AccountId));

        if (workspaces.Workspaces != null || workspaces.Workspaces?.Count != 0)
        {
            var createdPhysician = workspaces.Workspaces
                ?.Where(w =>
                    !string.IsNullOrWhiteSpace(w.Name) && physicians.Any(p => p == w.Name))
                .Select(a => new PhysicianModel
                {
                    Name = a.Name,
                    WorkspaceId = a.WorkspaceId
                }).ToList();

            if (createdPhysician?.Count >= physicians.Count)
            {
                return createdPhysician.DistinctBy(a => a.Name).ToList();
            }
        }

        foreach (var physician in physicians)
        {
            var workspaceBody = new CreateWorkspaceBody
            {
                Name = physician
            };
            var workspace = await ExecuteDocuSignCallAsync(
                "Workspace2.CreateWorkspaceAsync",
                new { accountRepository.AccountId, WorkspaceName = workspaceBody.Name },
                () => docuSignApiProvider.Workspace2.CreateWorkspaceAsync(accountRepository.AccountId, workspaceBody));

            physiciansWorkspaces.Add(new PhysicianModel
            {
                Name = physician,
                WorkspaceId = workspace.WorkspaceId
            });
        }

        return physiciansWorkspaces;
    }

    public async Task<List<CareDocumentsModel>> SubmitToPhysician(SubmitToPhysiciansModel model)
    {
        const string sentStatus = "sent";
        var documents = new List<CareDocumentsModel>();

        var userForCreate = new WorkspaceUserForCreate
        {
            Email = model.Email,
            FirstName = model.Physician.Name.Split(' ')[0],
            LastName = model.Physician.Name.Split(' ')[1]
        };
        await ExecuteDocuSignCallAsync(
            "WorkspaceUsers.AddWorkspaceUserAsync",
            new
            {
                accountRepository.AccountId,
                model.Physician.WorkspaceId,
                model.Email
            },
            () => docuSignApiProvider.WorkspaceUsers.AddWorkspaceUserAsync(
                accountRepository.AccountId,
                model.Physician.WorkspaceId,
                userForCreate));

        foreach (var document in model.Documents)
        {
            var documentRequest = new AddWorkspaceDocumentRequest
            {
                File = new AddWorkspaceDocumentRequestFile
                {
                    Content = Convert.FromBase64String(document.Base64String),
                    FileName = document.Name
                }
            };

            var addedDocumentResponse = await ExecuteDocuSignCallAsync(
                "WorkspaceDocuments.AddWorkspaceDocumentAsync",
                new
                {
                    accountRepository.AccountId,
                    model.Physician.WorkspaceId,
                    DocumentName = document.Name,
                    RequiresSignature = document.IsForSignature
                },
                () => docuSignApiProvider.WorkspaceDocuments.AddWorkspaceDocumentAsync(
                    accountRepository.AccountId,
                    model.Physician.WorkspaceId,
                    documentRequest));

            if (document.IsForSignature)
            {
                var workspaceEnvelopeForCreate = new WorkspaceEnvelopeForCreate
                {
                    EnvelopeName = document.Name,
                    DocumentIds = [addedDocumentResponse.DocumentId]
                };

                var envelopeResponse = await ExecuteDocuSignCallAsync(
                    "Workspace2.CreateWorkspaceEnvelopeAsync",
                    new
                    {
                        accountRepository.AccountId,
                        model.Physician.WorkspaceId,
                        DocumentName = document.Name
                    },
                    () => docuSignApiProvider.Workspace2.CreateWorkspaceEnvelopeAsync(
                        accountRepository.AccountId,
                        model.Physician.WorkspaceId,
                        workspaceEnvelopeForCreate));

                var eventNotificationUrl = $"{appConfiguration.DocuSign.EventNotificationBaseUrl}/api/callback/event";

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
                    Name = model.Physician.Name,
                    Email = model.Email,
                    RecipientId = "1",
                    Status = sentStatus,
                    Tabs = signer1Tabs
                };

                var recipients = new Recipients
                {
                    Signers = [signer1]
                };

                var updateEnvelopeRequest = new Envelope
                {
                    EmailSubject = "Please Sign",
                    EmailBlurb = "Sample text for email body",
                    EnvelopeId = envelopeResponse.EnvelopeId,
                    Recipients = recipients,
                    Status = sentStatus,
                };

                await ExecuteDocuSignCallAsync(
                    "EnvelopApi.UpdateAsync",
                    new
                    {
                        accountRepository.AccountId,
                        envelopeResponse.EnvelopeId,
                        EmailSubject = "Please Sign",
                        EmailBlurb = "Sample text for email body",
                        Recipients = recipients,
                        Status = sentStatus
                    },
                    () => docuSignApiProvider.EnvelopApi.UpdateAsync(
                        accountRepository.AccountId,
                        envelopeResponse.EnvelopeId,
                        updateEnvelopeRequest));

                documents.Add(new CareDocumentsModel(document.Name, document.IsForSignature, sentStatus));
            }
            else
            {
                documents.Add(new CareDocumentsModel(document.Name, document.IsForSignature, string.Empty));
            }
        }

        return documents;
    }

    private async Task<T> ExecuteDocuSignCallAsync<T>(string operation, object context, Func<Task<T>> operationCall)
    {
        var stopwatch = Stopwatch.StartNew();
        logger.LogInformation("DocuSign request started: {Operation}. Context: {@Context}", operation, context);

        try
        {
            var result = await operationCall();
            logger.LogInformation("DocuSign request succeeded: {Operation}. DurationMs: {DurationMs}. Context: {@Context}",
                operation, stopwatch.ElapsedMilliseconds, context);
            return result;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "DocuSign request failed: {Operation}. DurationMs: {DurationMs}. Context: {@Context}",
                operation, stopwatch.ElapsedMilliseconds, context);
            throw;
        }
    }
}
