using System.Net.Http;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using Docusign.IAM.SDK;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface IDocuSignApiProvider
    {
        IEnvelopesApi EnvelopApi { get; }
        ITemplatesApi TemplatesApi { get; }
        IAccountsApi AccountsApi { get; }
        IWorkspacesApi WorkspacesApi { get; }
        DocuSignClient ApiClient { get; }
        HttpClient DocuSignHttpClient { get; }
        IWorkspaces2 Workspace2 { get; }
        IWorkspaceUploadRequest WorkspaceUploadRequest { get; }
        IWorkspaceDocuments WorkspaceDocuments { get; }
        IWorkspaceUsers WorkspaceUsers { get; }
    }
}