using DocuSign.eSign.Model;

namespace DocuSign.Workspaces.Infrastructure.Services.Interfaces
{
    public interface ITemplateBuilder
    {
        EnvelopeTemplate BuildTemplate(string templateName);
        byte[] GetBinaryContent(string templateName);
    }
}