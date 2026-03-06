#!/bin/sh
set -e

if [ -n "${DOCUSIGN_PRIVATE_KEY_BASE64:-}" ]; then
  if printf "%s" "$DOCUSIGN_PRIVATE_KEY_BASE64" | base64 -d > /app/private.key 2>/dev/null; then
    chmod 600 /app/private.key
  elif [ -n "${DOCUSIGN_PRIVATE_KEY:-}" ]; then
    printf "%s" "$DOCUSIGN_PRIVATE_KEY" > /app/private.key
    chmod 600 /app/private.key
  else
    echo "DOCUSIGN_PRIVATE_KEY_BASE64 is set but invalid; no private key written." >&2
  fi
elif [ -n "${DOCUSIGN_PRIVATE_KEY:-}" ]; then
  printf "%s" "$DOCUSIGN_PRIVATE_KEY" > /app/private.key
  chmod 600 /app/private.key
fi

exec dotnet DocuSign.Workspaces.dll
