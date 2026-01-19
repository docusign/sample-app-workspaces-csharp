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
RUN /bin/bash <<'BASH'
set -euo pipefail
PROJECT_FILE="DocuSign.Workspaces.csproj"
if [ -f "$PROJECT_FILE" ]; then
    SELECTED_PROJECT="$PROJECT_FILE"
elif [ -f "DocuSign.Workspaces/DocuSign.Workspaces/$PROJECT_FILE" ]; then
    SELECTED_PROJECT="DocuSign.Workspaces/DocuSign.Workspaces/$PROJECT_FILE"
else
    echo "Unable to locate DocuSign.Workspaces.csproj in build context"
    exit 1
fi
PROJECT_DIR="$(dirname "$SELECTED_PROJECT")"
SPA_DIR="$PROJECT_DIR/ClientApp"

if [ -d "$SPA_DIR" ]; then
    npm ci --prefix "$SPA_DIR" --legacy-peer-deps
    npm run build --prefix "$SPA_DIR"
fi
dotnet restore "$SELECTED_PROJECT"
dotnet publish "$SELECTED_PROJECT" -c Release -o /app/publish --no-restore

if [ -d "$SPA_DIR/build" ]; then
    mkdir -p /app/publish/ClientApp
    cp -a "$SPA_DIR/build" /app/publish/ClientApp/
fi
BASH

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY DocuSign.Workspaces/DocuSign.Workspaces/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]
