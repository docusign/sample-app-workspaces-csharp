using System.Net.Http;
using DocuSign.eSign.Client;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface IDocuSignClientsFactory
    {
        HttpClient BuildHttpClient();
        DocuSignClient BuildDocuSignApiClient();
        DocuSignClient BuildDocuSignAuthClient(string authServer);
    }
}