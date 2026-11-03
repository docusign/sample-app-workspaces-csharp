using DocuSign.Workspaces.Infrastructure.Validation;
using Xunit;

namespace DocuSign.Workspaces.Tests.Infrastructure
{
    public class DocuSignEndpointValidatorTests
    {
        [Theory]
        [InlineData("https://account-d.docusign.com")]
        [InlineData("https://account-d.docusign.com/")]
        [InlineData("https://account-d.docusign.com:443")]
        [InlineData("HTTPS://ACCOUNT-D.DOCUSIGN.COM")]
        [InlineData("https://account.docusign.com")]
        [InlineData("https://account.docusign.com/")]
        [InlineData("HTTPS://ACCOUNT.DOCUSIGN.COM")]
        public void AcceptsApprovedDemoAuthEndpoint(string basePath)
        {
            DocuSignEndpointValidator.ValidateBasePath(basePath);
        }

        [Theory]
        [InlineData(null)]
        [InlineData("")]
        [InlineData("   ")]
        [InlineData("account-d.docusign.com")]
        [InlineData("//account-d.docusign.com")]
        public void RejectsMissingOrRelativeValues(string basePath)
        {
            Assert.Throws<ArgumentException>(() => DocuSignEndpointValidator.ValidateBasePath(basePath));
        }

        [Theory]
        [InlineData("https://attacker.example")]
        [InlineData("http://account-d.docusign.com")]
        [InlineData("https://account-d.docusign.com.attacker.example")]
        [InlineData("https://account-d.docusign.com.")]
        [InlineData("https://account-d.docusign.com@attacker.example")]
        [InlineData("https://account-d.docusign.com:8443")]
        [InlineData("https://attacker.example/account-d.docusign.com")]
        [InlineData("https://attacker.example#@account-d.docusign.com")]
        [InlineData("https://attacker.example\\@account-d.docusign.com")]
        [InlineData("https://account-d.docusign.com%2eattacker.example")]
        [InlineData("https://xn--account-d.docusign.com")]
        [InlineData("https://account.docusign.com.attacker.example")]
        [InlineData("https://account.docusign.com@attacker.example")]
        [InlineData("https://account.docusign.com:8443")]
        [InlineData("http://account.docusign.com")]
        [InlineData("https://attacker.example#@account.docusign.com")]
        [InlineData("https://account-p.docusign.com")]
        [InlineData("https://docusign.com")]
        [InlineData("https://127.0.0.1")]
        public void RejectsUnapprovedDestinations(string basePath)
        {
            Assert.Throws<ArgumentException>(() => DocuSignEndpointValidator.ValidateBasePath(basePath));
        }

        [Theory]
        [InlineData("account-d.docusign.com", true)]
        [InlineData("ACCOUNT-D.DOCUSIGN.COM", true)]
        [InlineData("account.docusign.com", false)]
        [InlineData("account-d.docusign.com.attacker.example", false)]
        public void IdentifiesDemoHostExactly(string host, bool expected)
        {
            Assert.Equal(expected, DocuSignEndpointValidator.IsDemoHost(host));
        }
    }
}
