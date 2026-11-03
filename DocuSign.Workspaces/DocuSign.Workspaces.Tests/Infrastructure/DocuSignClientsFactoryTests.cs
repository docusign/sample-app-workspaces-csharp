using DocuSign.eSign.Client;
using DocuSign.Workspaces.Infrastructure.Services;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Xunit;

namespace DocuSign.Workspaces.Tests.Infrastructure
{
    public class DocuSignClientsFactoryTests
    {
        private static DocuSignClientsFactory NewFactory() => new(null, null);

        [Fact]
        public void AuthClientNeverSendsTokenRequestToUnapprovedHost()
        {
            // .example is a reserved TLD: if the guard were bypassed this would fail with a DNS error instead of "blocked"
            var client = NewFactory().BuildDocuSignAuthClient("attacker.example");

            var ex = Assert.Throws<ApiException>(() => client.GenerateAccessToken("integration-key", "secret", "code"));

            Assert.Contains("blocked", ex.ToString());
        }

        [Fact]
        public async System.Threading.Tasks.Task AuthClientNeverSendsJwtAssertionToUnapprovedHost()
        {
            var client = NewFactory().BuildDocuSignAuthClient("attacker.example");
            var key = System.Text.Encoding.UTF8.GetBytes(TestRsaKey.Pem);

            var ex = await Assert.ThrowsAsync<ApiException>(() => client.RequestJWTUserTokenAsync(
                "integration-key", "victim-user-id", "attacker.example", key, 1, new() { "signature" }));

            Assert.Contains("blocked", ex.ToString());
        }
    }

    internal static class TestRsaKey
    {
        public static readonly string Pem = System.Security.Cryptography.RSA.Create(2048).ExportRSAPrivateKeyPem();
    }
}
