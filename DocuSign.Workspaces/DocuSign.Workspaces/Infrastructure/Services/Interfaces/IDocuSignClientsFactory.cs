using System.Net.Http;
using DocuSign.eSign.Client;
using Docusign.IAM.SDK;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface IDocuSignClientsFactory
    {
        HttpClient BuildHttpClient();

        DocuSignClient BuildDocuSignApiClient();

        DocuSignClient BuildDocuSignAuthClient(string authServer);

        SDKConfig BuildSdkConfig();
    }
}