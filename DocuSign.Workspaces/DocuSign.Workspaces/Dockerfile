FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80

FROM node:20-bullseye-slim AS node

FROM mcr.microsoft.com/dotnet/sdk:8.0-bookworm-slim AS build
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true
COPY --from=node /usr/local /usr/local
WORKDIR /src
COPY . .
RUN dotnet restore "DocuSign.Workspaces.csproj"
RUN dotnet publish "DocuSign.Workspaces.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DocuSign.Workspaces.dll"]
