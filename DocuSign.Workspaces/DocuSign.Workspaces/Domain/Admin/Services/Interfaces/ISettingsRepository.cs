using DocuSign.Workspaces.Domain.Admin.Models;

namespace DocuSign.Workspaces.Domain.Admin.Services.Interfaces
{
    public interface ISettingsRepository
    {
        public Settings Get();

        public Settings Save(Settings model);
    }
}
