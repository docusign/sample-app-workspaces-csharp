using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using DocuSign.Workspaces.Infrastructure.Services;
using Xunit;

namespace DocuSign.Workspaces.Tests.Infrastructure
{
    public class AuthHostGuardHandlerTests
    {
        [Fact]
        public void DoesNotFollowRedirects()
        {
            var handler = AuthHostGuardHandler.Create() as AuthHostGuardHandler;

            Assert.False(((SocketsHttpHandler)handler.InnerHandler).AllowAutoRedirect);
        }

        [Theory]
        [InlineData("https://attacker.example/oauth/token")]
        [InlineData("http://account-d.docusign.com/oauth/token")]
        [InlineData("https://account-d.docusign.com.attacker.example/oauth/token")]
        [InlineData("https://account-d.docusign.com@attacker.example/oauth/token")]
        [InlineData("https://account.docusign.com.attacker.example/oauth/token")]
        public async Task BlocksRequestsToUnapprovedDestinationsWithoutSendingThem(string url)
        {
            var inner = new RecordingHandler();
            using var client = new HttpClient(new AuthHostGuardHandler(inner));

            await Assert.ThrowsAsync<HttpRequestException>(() => client.PostAsync(url, new StringContent("assertion=secret")));

            Assert.Equal(0, inner.Calls);
        }

        [Theory]
        [InlineData("https://account-d.docusign.com/oauth/token")]
        [InlineData("https://account.docusign.com/oauth/token")]
        public async Task SendsRequestsToApprovedDestination(string url)
        {
            var inner = new RecordingHandler();
            using var client = new HttpClient(new AuthHostGuardHandler(inner));

            var response = await client.PostAsync(url, new StringContent("grant_type=x"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Equal(1, inner.Calls);
        }

        private class RecordingHandler : HttpMessageHandler
        {
            public int Calls { get; private set; }

            protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                Calls++;
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK));
            }
        }
    }
}
