using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using DocuSign.Workspaces.Infrastructure.Validation;
using Microsoft.Extensions.Logging;

namespace DocuSign.Workspaces.Infrastructure.Services
{
    /// <summary>
    /// Last line of defence for OAuth traffic: refuses to send any request (JWT assertion, auth code,
    /// access token) to a host outside the DocuSign authentication allowlist. Redirects are never followed,
    /// so a response cannot move the request to another destination.
    /// </summary>
    public class AuthHostGuardHandler : DelegatingHandler
    {
        private readonly ILogger _logger;

        public AuthHostGuardHandler(HttpMessageHandler inner, ILogger logger = null) : base(inner)
        {
            _logger = logger;
        }

        public static HttpMessageHandler Create(ILogger logger = null)
        {
            return new AuthHostGuardHandler(new SocketsHttpHandler { AllowAutoRedirect = false }, logger);
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Guard(request);
            return base.SendAsync(request, cancellationToken);
        }

        protected override HttpResponseMessage Send(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            Guard(request);
            return base.Send(request, cancellationToken);
        }

        private void Guard(HttpRequestMessage request)
        {
            try
            {
                DocuSignEndpointValidator.ValidateBasePath(request.RequestUri?.GetLeftPart(UriPartial.Authority));
            }
            catch (ArgumentException)
            {
                _logger?.LogWarning("Blocked outbound OAuth request to unexpected destination: {Host}", request.RequestUri?.Host);
                throw new HttpRequestException("Outbound request blocked: destination is not an approved DocuSign authentication endpoint.");
            }
        }
    }
}
