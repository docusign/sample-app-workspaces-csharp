using System;
using System.Diagnostics.CodeAnalysis;
using System.Net.Http;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using Docusign.IAM.SDK;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Infrastructure.Services
{
    [ExcludeFromCodeCoverage]
    public class DocuSignApiProvider : IDocuSignApiProvider
    {
        private readonly IDocuSignClientsFactory _docuSignClientsFactory;

        private Lazy<IEnvelopesApi> _envelopApi => new (() => new EnvelopesApi(_apiClient.Value));
        private Lazy<IWorkspacesApi> _workspacesApi => new (() => new WorkspacesApi(_apiClient.Value));
        private Lazy<ITemplatesApi> _templatesApi => new (() => new TemplatesApi(_apiClient.Value));
        private Lazy<IAccountsApi> _accountsApi => new (() => new AccountsApi(_apiClient.Value));
        private Lazy<IWorkspaces2> _workspace2;
        private Lazy<IWorkspaceUploadRequest> _workspaceUploadRequest;
        private Lazy<IWorkspaceDocuments> _workspaceDocuments;
        private Lazy<IWorkspaceUsers> _workspaceUsers;

        private Lazy<DocuSignClient> _apiClient => new (() => _docuSignClientsFactory.BuildDocuSignApiClient());
        private Lazy<HttpClient> _docuSignHttpClient => new (() => _docuSignClientsFactory.BuildHttpClient());
        private Lazy<SDKConfig> _docusingSdkConfig => new (() => _docuSignClientsFactory.BuildSdkConfig().GetAwaiter().GetResult());

        public DocuSignApiProvider(IDocuSignClientsFactory docuSignClientsFactory)
        {
            _workspace2 = new Lazy<IWorkspaces2>(() => new Workspaces2(_docusingSdkConfig.Value));
            _workspaceUploadRequest = new Lazy<IWorkspaceUploadRequest>(() => new WorkspaceUploadRequest(_docusingSdkConfig.Value));
            _workspaceDocuments = new Lazy<IWorkspaceDocuments>(() => new WorkspaceDocuments(_docusingSdkConfig.Value));
            _workspaceUsers = new Lazy<IWorkspaceUsers>(() => new WorkspaceUsers(_docusingSdkConfig.Value));
            _docuSignClientsFactory = docuSignClientsFactory;
        }

        public IEnvelopesApi EnvelopApi => _envelopApi.Value;
        public IWorkspacesApi WorkspacesApi => _workspacesApi.Value;
        public ITemplatesApi TemplatesApi => _templatesApi.Value;
        public IAccountsApi AccountsApi => _accountsApi.Value;
        public DocuSignClient ApiClient => _apiClient.Value;
        public IWorkspaces2 Workspace2 => _workspace2.Value;
        public IWorkspaceUploadRequest WorkspaceUploadRequest => _workspaceUploadRequest.Value;
        public IWorkspaceDocuments WorkspaceDocuments => _workspaceDocuments.Value;
        public IWorkspaceUsers WorkspaceUsers => _workspaceUsers.Value;

        public HttpClient DocuSignHttpClient => _docuSignHttpClient.Value;
    }
}
