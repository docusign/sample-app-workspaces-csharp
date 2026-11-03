using System.Collections.Generic;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace DocuSign.Workspaces.Tests.Infrastructure
{
    /// <summary>
    /// Hosts the real pipeline with placeholder DocuSign settings. Tests only exercise paths that are rejected
    /// before any call to DocuSign, so no network access or credentials are needed.
    /// </summary>
    public class WorkspacesWebApplicationFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.ConfigureAppConfiguration((_, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["DocuSign:IntegrationKey"] = "test-integration-key",
                    ["DocuSign:SecretKey"] = "test-secret",
                    ["DocuSign:SecretKeyProd"] = "test-secret-prod",
                    ["DocuSign:RedirectBaseUrl"] = "https://localhost/",
                    ["DocuSign:EventNotificationBaseUrl"] = "https://localhost",
                    ["DocuSign:RSAPrivateKeyFile"] = "private.key",
                    ["DocuSign:JWTLifeTime"] = "3600",
                    ["ClientAppUrl"] = "https://localhost/app",
                });
            });
        }
    }
}
