using DocuSign.eSign.Model;

namespace DocuSign.Workspaces.Infrustructure.Services.Interfaces
{
    public interface ITemplateBuilder
    {
        EnvelopeTemplate BuildTemplate(string templateName);
        byte[] GetBinaryContent(string templateName);
    }
}