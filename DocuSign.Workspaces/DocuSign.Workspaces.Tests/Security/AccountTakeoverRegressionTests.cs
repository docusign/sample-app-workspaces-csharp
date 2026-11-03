using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using DocuSign.Workspaces.Tests.Infrastructure;
using Xunit;

namespace DocuSign.Workspaces.Tests.Security
{
    /// <summary>
    /// Replays the reported unauthenticated account-takeover chain (arbitrary userId / accountId / basePath)
    /// against the real request pipeline. Every request here must be refused before the server contacts DocuSign.
    /// </summary>
    public class AccountTakeoverRegressionTests : IClassFixture<WorkspacesWebApplicationFactory>
    {
        private const string VictimUserId = "b4f9c980-4f8e-4617-93d2-db2dcd5cf04b";
        private const string VictimAccountId = "559960c8-cb3f-4118-a34f-c200eabc8a86";

        private readonly WorkspacesWebApplicationFactory _factory;

        public AccountTakeoverRegressionTests(WorkspacesWebApplicationFactory factory)
        {
            _factory = factory;
        }

        private HttpClient NewClient() => _factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            HandleCookies = true,
            BaseAddress = new Uri("https://localhost")
        });

        private static StringContent Json(string body) => new(body, Encoding.UTF8, "application/json");

        [Theory]
        [InlineData("https://attacker.example")]
        [InlineData("https://account-d.docusign.com")]
        public async Task AccountsIgnoresCallerSuppliedBasePathAndUserId(string basePath)
        {
            using var client = NewClient();

            var response = await client.GetAsync($"/api/accounts?basePath={basePath}&userId={VictimUserId}");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Contains("Consent must be granted", await response.Content.ReadAsStringAsync());
        }

        [Theory]
        [InlineData("https://account-d.docusign.com")]
        [InlineData("https://attacker.example")]
        public async Task ConnectCannotEstablishSessionFromRequestControlledIdentity(string basePath)
        {
            using var client = NewClient();
            var body = $"{{\"authenticationType\":1,\"accountId\":\"{VictimAccountId}\",\"userId\":\"{VictimUserId}\",\"basePath\":\"{basePath}\",\"baseUri\":\"https://demo.docusign.net\"}}";

            var response = await client.PostAsync("/api/account/connect", Json(body));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(response.Headers.Contains("Set-Cookie") && response.Headers.GetValues("Set-Cookie").Any(c => c.StartsWith("UserLoginCookie")));
        }

        [Fact]
        public async Task ConnectDoesNotLeaveAnAuthenticatedSession()
        {
            using var client = NewClient();
            var body = $"{{\"authenticationType\":1,\"accountId\":\"{VictimAccountId}\",\"userId\":\"{VictimUserId}\",\"baseUri\":\"https://demo.docusign.net\"}}";
            await client.PostAsync("/api/account/connect", Json(body));

            var status = await client.GetStringAsync("/api/account/status");

            Assert.Contains("\"isConnected\":false", status);
        }

        [Theory]
        [InlineData("{\"authenticationType\":2}")]
        [InlineData("{\"authenticationType\":\"TestAccount\"}")]
        [InlineData("{\"authenticationType\":2,\"userId\":\"b4f9c980-4f8e-4617-93d2-db2dcd5cf04b\",\"accountId\":\"559960c8-cb3f-4118-a34f-c200eabc8a86\"}")]
        public async Task ConnectRejectsTestAccountAuthenticationAndLeavesNoSession(string body)
        {
            using var client = NewClient();

            var response = await client.PostAsync("/api/account/connect", Json(body));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.False(response.Headers.Contains("Set-Cookie") && response.Headers.GetValues("Set-Cookie").Any(c => c.StartsWith("UserLoginCookie")));
            Assert.Contains("\"isConnected\":false", await client.GetStringAsync("/api/account/status"));
        }

        [Theory]
        [InlineData("https://attacker.example")]
        [InlineData("http://account-d.docusign.com")]
        [InlineData("https://account-d.docusign.com.attacker.example")]
        [InlineData("https://account-d.docusign.com@attacker.example")]
        [InlineData("https://account-d.docusign.com:8443")]
        [InlineData("https://attacker.example#@account-d.docusign.com")]
        [InlineData("https://account.docusign.com.attacker.example")]
        [InlineData("https://account.docusign.com@attacker.example")]
        public async Task ConsentRejectsUnapprovedBasePath(string basePath)
        {
            using var client = NewClient();

            var response = await client.PostAsync("/api/account/consent/obtain",
                Json($"{{\"basePath\":\"{basePath}\",\"consentType\":2}}"));

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        [Theory]
        [InlineData("https://account-d.docusign.com")]
        [InlineData("https://account.docusign.com")]
        public async Task ConsentAcceptsDocuSignAuthHostsAndBindsState(string basePath)
        {
            using var client = NewClient();

            var response = await client.PostAsync("/api/account/consent/obtain",
                Json($"{{\"basePath\":\"{basePath}\",\"consentType\":2}}"));

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var payload = await response.Content.ReadAsStringAsync();
            Assert.Contains(basePath, payload);
            Assert.Contains("state=", payload);
        }

        [Theory]
        [InlineData("/api/consentcallback?code=attacker-code")]
        [InlineData("/api/consentcallback?code=attacker-code&state=guessed")]
        public async Task ConsentCallbackWithoutMatchingSessionStateIsRejected(string url)
        {
            using var client = NewClient();

            var response = await client.GetAsync(url);

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var status = await client.GetStringAsync("/api/account/status");
            Assert.Contains("\"isConsentGranted\":false", status);
        }

        [Fact]
        public async Task ConsentCallbackWithWrongStateAfterRealConsentStartIsRejected()
        {
            using var client = NewClient();
            await client.PostAsync("/api/account/consent/obtain",
                Json("{\"basePath\":\"https://account-d.docusign.com\",\"consentType\":2}"));

            var response = await client.GetAsync("/api/consentcallback?code=attacker-code&state=wrong");

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var status = await client.GetStringAsync("/api/account/status");
            Assert.Contains("\"isConsentGranted\":false", status);
        }

        [Theory]
        [InlineData("GET", "/api/settings/datasource")]
        [InlineData("PUT", "/api/settings")]
        [InlineData("GET", "/api/account/disconnect")]
        [InlineData("GET", "/api/account/logout")]
        public async Task ProtectedEndpointsRequireAuthentication(string method, string url)
        {
            using var client = NewClient();
            var request = new HttpRequestMessage(new HttpMethod(method), url) { Content = Json("{}") };

            var response = await client.SendAsync(request);

            Assert.True(response.StatusCode is HttpStatusCode.Redirect or HttpStatusCode.Unauthorized,
                $"{method} {url} returned {(int)response.StatusCode}");
        }
    }
}
