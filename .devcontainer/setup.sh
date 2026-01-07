#!/bin/bash
set -e

echo "🚀 Setting up Payments System workspace..."

# Clone related repositories if they don't exist
if [ ! -d "/workspaces/payments-ui" ]; then
  echo "📦 Cloning payments-ui..."
  git clone /workspaces/payments-ui /workspaces/payments-ui-temp || true
  if [ -d "/workspaces/payments-ui-temp" ]; then
    mv /workspaces/payments-ui-temp /workspaces/payments-ui
  fi
fi

if [ ! -d "/workspaces/recon-worker" ]; then
  echo "📦 Cloning recon-worker..."
  git clone /workspaces/recon-worker /workspaces/recon-worker-temp || true
  if [ -d "/workspaces/recon-worker-temp" ]; then
    mv /workspaces/recon-worker-temp /workspaces/recon-worker
  fi
fi

echo "✅ Workspace setup complete"
