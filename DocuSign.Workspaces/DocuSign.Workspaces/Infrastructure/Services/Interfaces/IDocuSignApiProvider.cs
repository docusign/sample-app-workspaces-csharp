using System.Net.Http;
using DocuSign.eSign.Api;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface IDocuSignApiProvider
    {
        IEnvelopesApi EnvelopApi { get; }
        ITemplatesApi TemplatesApi { get; }
        IAccountsApi AccountsApi { get; }
        IWorkspacesApi WorkspacesApi { get; }

        HttpClient DocuSignHttpClient { get; }
    }
}