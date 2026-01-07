#!/bin/bash
set -e

echo "🚀 Setting up Payments System workspace..."

# GitHub repository URLs (update these with your actual GitHub username/org)
GITHUB_USER="${GITHUB_USER:-GMorcosEE}"
PAYMENTS_UI_REPO="https://github.com/${GITHUB_USER}/payments-ui.git"
RECON_WORKER_REPO="https://github.com/${GITHUB_USER}/recon-worker.git"

# Clone payments-ui if it doesn't exist
if [ ! -d "/workspaces/payments-ui" ]; then
  echo "📦 Cloning payments-ui from ${PAYMENTS_UI_REPO}..."
  git clone "${PAYMENTS_UI_REPO}" /workspaces/payments-ui || {
    echo "⚠️  Failed to clone payments-ui. Make sure the repository exists and is accessible."
    exit 1
  }
  echo "✅ payments-ui cloned successfully"
else
  echo "✅ payments-ui already exists"
fi

# Clone recon-worker if it doesn't exist
if [ ! -d "/workspaces/recon-worker" ]; then
  echo "📦 Cloning recon-worker from ${RECON_WORKER_REPO}..."
  git clone "${RECON_WORKER_REPO}" /workspaces/recon-worker || {
    echo "⚠️  Failed to clone recon-worker. Make sure the repository exists and is accessible."
    exit 1
  }
  echo "✅ recon-worker cloned successfully"
else
  echo "✅ recon-worker already exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install dependencies for all repositories
echo "Installing payments-api dependencies..."
cd /workspaces/payments-api && npm install

echo "Installing payments-ui dependencies..."
cd /workspaces/payments-ui && npm install

echo "Installing recon-worker dependencies..."
cd /workspaces/recon-worker && npm install

echo ""
echo "🗄️  Running database migrations..."
echo ""

# Wait for PostgreSQL to be ready (it will be started by automations)
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if docker exec payments-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "⚠️  PostgreSQL not ready after 30 seconds, migrations may fail"
  fi
  sleep 1
done

# Run migrations
cd /workspaces/payments-api && npm run migrate

echo ""
echo "✅ Workspace setup complete!"
echo ""
echo "Repository structure:"
echo "  /workspaces/payments-api   (this repo)"
echo "  /workspaces/payments-ui    (cloned)"
echo "  /workspaces/recon-worker   (cloned)"
echo ""
echo "Services will start automatically via automations."
echo ""
