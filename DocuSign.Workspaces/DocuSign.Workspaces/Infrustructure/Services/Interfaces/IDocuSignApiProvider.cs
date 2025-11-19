using System.Net.Http;
using DocuSign.eSign.Api;

namespace DocuSign.Workspaces.Infrustructure.Services.Interfaces
{
    public interface IDocuSignApiProvider
    {
        IEnvelopesApi EnvelopApi { get; }
        ITemplatesApi TemplatesApi { get; }
        IAccountsApi AccountsApi { get; }

        HttpClient DocuSignHttpClient { get; }
    }
}