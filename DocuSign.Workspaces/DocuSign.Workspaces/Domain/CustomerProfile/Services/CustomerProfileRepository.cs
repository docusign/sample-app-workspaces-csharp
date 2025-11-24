using DocuSign.Workspaces.Domain.Admin.Services.Interfaces;
using DocuSign.Workspaces.Domain.CustomerProfile.Models;
using DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;

namespace DocuSign.Workspaces.Domain.CustomerProfile.Services
{
    public class CustomerProfileRepository : ICustomerProfileRepository
    {
        private readonly ISettingsRepository _settingsRepository;

        public CustomerProfileRepository(IAppConfiguration appConfiguration, ISettingsRepository settingsRepository)
        {
            _settingsRepository = settingsRepository;

            Login = appConfiguration.CustomerProfile.Login;
            Password = appConfiguration.CustomerProfile.Password;
        }

        public string Login { get; private set; }
        public string Password { get; private set; }
        public CustomerProfileSignerInfo ProfileSignerInfo
        {
            get
            {
                var settings = _settingsRepository.Get();
                return new CustomerProfileSignerInfo
                {
                    SignerName = settings.UserProfile.FullName,
                    SignerEmail = settings.UserProfile.Email,
                    CountryCode = settings.UserProfile.CountryCode,
                    SignerPhone = settings.UserProfile.PhoneNumber
                };
            }
        }
    }
}