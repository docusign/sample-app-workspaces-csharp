using System;
using System.Collections.Generic;

namespace DocuSign.Workspaces.Infrastructure.Validation
{
    public static class DocuSignEndpointValidator
    {
        private static readonly HashSet<string> AllowedAuthHosts = new(StringComparer.OrdinalIgnoreCase)
        {
            "account-d.docusign.com"
        };

        public static void ValidateBasePath(string basePath)
        {
            if (string.IsNullOrWhiteSpace(basePath))
                throw new ArgumentException("basePath is required.");

            if (!Uri.TryCreate(basePath, UriKind.Absolute, out var uri))
                throw new ArgumentException("basePath is not a valid URL.");

            if (!string.Equals(uri.Scheme, "https", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("basePath must use HTTPS.");

            if (!AllowedAuthHosts.Contains(uri.Host))
                throw new ArgumentException("basePath must be a known DocuSign authentication endpoint.");
        }
    }
}
