using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using DocuSign.eSign.Client;
using Docusign.IAM.SDK;
using Docusign.IAM.SDK.Hooks;
using Docusign.IAM.SDK.Models.Components;
using Docusign.IAM.SDK.Utils;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Newtonsoft.Json;

namespace DocuSign.Workspaces.Infrastructure.Services
{
    public class DocuSignClientsFactory : IDocuSignClientsFactory
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IHttpClientFactory _clientFactory;

        public DocuSignClientsFactory(IAccountRepository accountRepository, IHttpClientFactory clientFactory)
        {
            _accountRepository = accountRepository;
            _clientFactory = clientFactory;
        }

        public DocuSignClient BuildDocuSignApiClient()
        {
            var docuSignConfig = new Configuration(_accountRepository.BaseUri + "/restapi");
            docuSignConfig.AddDefaultHeader("Authorization", "Bearer " + _accountRepository.AccessToken);
            docuSignConfig.AccessToken = _accountRepository.AccessToken;
            var apiClient = new DocuSignClient(docuSignConfig);
            apiClient.SetBasePath(docuSignConfig.BasePath);
            return apiClient;
        }

        public async Task<SDKConfig> BuildSdkConfig()
        {
            
            var config = new SDKConfig
            {
                SecuritySource = () => new Security
                {
                    AccessToken = _accountRepository.AccessToken ?? ""
                },
                Client = new SpeakeasyHttpClient(),
                ServerUrl = SDKConfig.ServerMap[0],
                UserAgent = "MyCompany-Integration/1.0",
                Hooks = new SDKHooks()
            };
            return config;
        }

        public DocuSignClient BuildDocuSignAuthClient(string authServer)
        {
            var client = new DocuSignClient();
            client.SetOAuthBasePath(authServer);
            return client;
        }

        public HttpClient BuildHttpClient()
        {
            HttpClient client = _clientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("Authorization", "Bearer " + _accountRepository.AccessToken);
            client.BaseAddress = new Uri(_accountRepository.BaseUri);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }
    }
}
