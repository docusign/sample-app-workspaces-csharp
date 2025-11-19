using DocuSign.eSign.Client;
using System.Net.Http;

namespace DocuSign.Workspaces.Infrustructure.Services.Interfaces
{
    public interface IDocuSignClientsFactory
    {
        HttpClient BuildHttpClient();
        DocuSignClient BuildDocuSignApiClient();
        DocuSignClient BuildDocuSignAuthClient(string authServer);
    }
}