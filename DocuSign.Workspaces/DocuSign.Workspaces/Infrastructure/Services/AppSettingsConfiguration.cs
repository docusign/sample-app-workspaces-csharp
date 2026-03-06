using DocuSign.Workspaces.Domain.CustomerProfile.Models;
using DocuSign.Workspaces.Infrastructure.Models;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DocuSign.Workspaces.Infrastructure.Services
{
    public class AppSettingsConfiguration : IAppConfiguration
    {
        public AppSettingsConfiguration(IConfiguration configuration)
        {
            ClientAppUrl = configuration["ClientAppUrl"];
            DocuSign = new AppConfigurationDocuSign
            {
                IntegrationKey = configuration["DocuSign:IntegrationKey"],
                SecretKey = configuration["DocuSign:SecretKey"],
                SecretKeyProd = configuration["DocuSign:SecretKeyProd"],
                RedirectBaseUrl = configuration["DocuSign:RedirectBaseUrl"],
                EventNotificationBaseUrl = configuration["DocuSign:EventNotificationBaseUrl"],
                RSAPrivateKeyFile = configuration["DocuSign:RSAPrivateKeyFile"],
                JWTLifeTime = int.Parse(configuration["DocuSign:JWTLifeTime"]),
                TestAccountConnectionSettings = new AppSettingTestAccount
                {
                    BasePath = configuration["DocuSign:TestAccountConnectionSettings:BasePath"],
                    BaseUri = configuration["DocuSign:TestAccountConnectionSettings:BaseUri"],
                    UserId = configuration["DocuSign:TestAccountConnectionSettings:UserId"],
                    AccountId = configuration["DocuSign:TestAccountConnectionSettings:AccountId"],
                }
            };
            CustomerProfile = new AppConfigurationCustomerProfile
            {
                Login = configuration["CustomerProfile:Login"],
                Password = configuration["CustomerProfile:Password"],
            };
        }

        public string ClientAppUrl { get; set; }
        public AppConfigurationDocuSign DocuSign { get; set; }
        public AppConfigurationCustomerProfile CustomerProfile { get; set; }
    }
}
