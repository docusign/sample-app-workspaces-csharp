#!/bin/sh
set -e

if [ -n "${DOCUSIGN_PRIVATE_KEY_BASE64:-}" ]; then
  echo "$DOCUSIGN_PRIVATE_KEY_BASE64" | base64 -d > /app/private.key
  chmod 600 /app/private.key
elif [ -n "${DOCUSIGN_PRIVATE_KEY:-}" ]; then
  printf "%s" "$DOCUSIGN_PRIVATE_KEY" > /app/private.key
  chmod 600 /app/private.key
fi

exec dotnet DocuSign.Workspaces.dll
