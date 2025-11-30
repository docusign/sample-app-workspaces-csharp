using System.Threading.Tasks;
using DocuSign.Workspaces.Domain.Admin.Services;
using DocuSign.Workspaces.Domain.Admin.Services.Interfaces;
using DocuSign.Workspaces.Domain.CarePlans;
using DocuSign.Workspaces.Domain.Common.Services;
using DocuSign.Workspaces.Domain.CustomerProfile.Services;
using DocuSign.Workspaces.Domain.CustomerProfile.Services.Interfaces;
using DocuSign.Workspaces.Domain.CustomQuote.Services;
using DocuSign.Workspaces.Domain.CustomQuote.Services.Interfaces;
using DocuSign.Workspaces.Domain.EmploymentContract.Services;
using DocuSign.Workspaces.Domain.EmploymentContract.Services.Interfaces;
using DocuSign.Workspaces.Domain.TermsAndConditions.Services;
using DocuSign.Workspaces.Domain.TermsAndConditions.Services.Interfaces;
using DocuSign.Workspaces.Domain.Workspaces;
using DocuSign.Workspaces.Hubs;
using DocuSign.Workspaces.Infrastructure.Extensions;
using DocuSign.Workspaces.Infrastructure.Services;
using DocuSign.Workspaces.Infrastructure.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DocuSign.Workspaces
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMemoryCache();
            services.AddSession();
            services.AddDistributedMemoryCache();
            services.AddHttpContextAccessor();
            services.AddScoped<IAuthenticationService, AuthenticationService>();
            services.AddScoped<ITemplateBuilder, LocalTemplateBuilder>();
            services.AddHttpClient<DocuSignApiProvider>();
            services.AddScoped<IDocuSignApiProvider, DocuSignApiProvider>();
            services.AddScoped<ISettingsRepository, SessionSettingsRepository>();
            services.AddScoped<IAccountRepository, ClaimsAccountRepository>();
            services.AddScoped<ICustomerProfileRepository, CustomerProfileRepository>();
            services.AddScoped<IDocuSignClientsFactory, DocuSignClientsFactory>();
            services.AddScoped<ITestAccountConnectionSettingsRepository, AppSettingsTestAccountConnectionSettingsRepository>();
            services.AddSingleton<IEventsRepository, InMemoryEventsRepository>();
            services.AddSingleton<IAppConfiguration, AppSettingsConfiguration>();

            services.AddScoped<IEmploymentContractEnvelopeService, EmploymentContractEnvelopeService>();
            services.AddScoped<IEmploymentContractEnvelopeBuilder, EmploymentContractEnvelopeBuilder>();

            services.AddScoped<ITermsAndConditionsEnvelopeService, TermsAndConditionsEnvelopeService>();
            services.AddScoped<ITermsAndConditionsEnvelopeBuilder, TermsAndConditionsEnvelopeBuilder>();

            services.AddScoped<ICustomerProfileEnvelopeService, CustomerProfileEnvelopeService>();
            services.AddScoped<ICustomerProfileEnvelopeBuilder, CustomerProfileEnvelopeBuilder>();

            services.AddScoped<ICustomQuoteEnvelopeService, CustomQuoteEnvelopeService>();
            services.AddScoped<ICustomQuoteEnvelopeBuilder, CustomQuoteEnvelopeBuilder>();

            services.AddScoped<IWealthManagementClient, WealthManagementClient>();
            services.AddScoped<ICarePlansService, CarePlansService>();

            // In production, the SPA assets will be served from this directory
            services.AddSpaStaticFiles(configuration =>
                {
                    configuration.RootPath = "ClientApp/build";
                });

            services.AddAuthentication(options =>
            {
                options.DefaultSignOutScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            })
            .AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, config =>
            {
                config.Cookie.Name = "UserLoginCookie";
                config.Cookie.HttpOnly = true;
                config.Cookie.SameSite = SameSiteMode.Lax;
                config.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            services.AddControllers().AddNewtonsoftJson();

            services.AddSwaggerGen();
            services.AddEndpointsApiExplorer();

            services.ConfigureApplicationCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.Headers["Location"] = context.RedirectUri;
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });

            services.AddSignalR();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddFile("Logs/myapp-{Date}.txt");
            app.UseSession();
            app.ConfigureDocuSignExceptionHandling(loggerFactory);
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            if (!env.IsDevelopment())
            {
                app.UseSpaStaticFiles();
            }

            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller}/{action=Index}/{id?}");
                endpoints.MapHub<EventsHub>("/events-hub");
            });
            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (env.IsDevelopment())
                {
                    // CRA dev server
                    spa.UseProxyToSpaDevelopmentServer("http://localhost:3000");
                }
            });
        }
    }
}
