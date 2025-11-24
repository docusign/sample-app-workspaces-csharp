using System;

namespace DocuSign.Workspaces.Infrastructure.Exceptions
{
    public class IDVException : Exception
    {
        public IDVException(string message)
            : base(message) { }

        public IDVException(Exception inner)
            : base("Exception occured during enabling Identity Verification process. Check that IDV is enabled in Docusign account.", inner) { }
    }
}
