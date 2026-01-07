# GitHub Repository Setup Guide

This guide explains how to set up the three repositories on GitHub to enable automatic multi-repository orchestration in Ona/Gitpod.

## Overview

The payment system consists of three separate repositories:

1. **payments-api** (orchestrator) - Main repository with devcontainer
2. **payments-ui** - Next.js interface
3. **recon-worker** - Background worker

When you open `payments-api` in Ona/Gitpod, it automatically clones the other two repositories into the same workspace.

## Step 1: Create GitHub Repositories

Create three **public** repositories on GitHub:

```bash
# Option 1: Using GitHub CLI (if available)
gh repo create payments-api --public --description "Payment processing API with Postgres"
gh repo create payments-ui --public --description "Next.js payment processing interface"
gh repo create recon-worker --public --description "Background worker for payment reconciliation"

# Option 2: Using GitHub web interface
# Go to https://github.com/new and create each repository
```

## Step 2: Push Code to GitHub

From this workspace, push each repository:

```bash
# Push payments-api (orchestrator)
cd /workspaces/workspaces/payments-api
git remote add origin https://github.com/YOUR_USERNAME/payments-api.git
git branch -M main
git push -u origin main

# Push payments-ui
cd /workspaces/workspaces/payments-ui
git remote add origin https://github.com/YOUR_USERNAME/payments-ui.git
git branch -M main
git push -u origin main

# Push recon-worker
cd /workspaces/workspaces/recon-worker
git remote add origin https://github.com/YOUR_USERNAME/recon-worker.git
git branch -M main
git push -u origin main
```

## Step 3: Update Clone URLs

Update the setup script in `payments-api` to use your GitHub username:

```bash
cd /workspaces/workspaces/payments-api
# Edit .devcontainer/setup.sh and replace YOUR_USERNAME with your actual GitHub username
```

Or set the `GITHUB_USER` environment variable in your devcontainer:

```json
{
  "containerEnv": {
    "GITHUB_USER": "your-github-username"
  }
}
```

## Step 4: Test Multi-Repo Setup

1. Delete your local workspace
2. Open `https://github.com/YOUR_USERNAME/payments-api` in Ona/Gitpod
3. The devcontainer will automatically:
   - Clone `payments-ui` to `/workspaces/payments-ui`
   - Clone `recon-worker` to `/workspaces/recon-worker`
   - Set up the complete development environment

## Step 5: Verify Setup

After the devcontainer builds, verify all repos are present:

```bash
ls -la /workspaces/
# Should show:
# - payments-api/
# - payments-ui/
# - recon-worker/
```

## Repository Structure

```
/workspaces/
├── payments-api/          # Main repo (opened in Ona)
│   ├── .devcontainer/
│   │   ├── devcontainer.json
│   │   └── setup.sh       # Clones other repos
│   ├── .ona/
│   │   └── automations.yaml
│   └── src/
├── payments-ui/           # Auto-cloned
│   ├── app/
│   └── package.json
└── recon-worker/          # Auto-cloned
    ├── src/
    └── package.json
```

## Automations

The `.ona/automations.yaml` file in `payments-api` orchestrates all three repositories:

- **Tasks**: `install-deps`, `migrate`, `validate`
- **Services**: `postgres`, `api`, `ui`, `worker`

## Quick Start After Setup

```bash
# Install dependencies
gitpod automations task start install-deps

# Start Postgres
gitpod automations service start postgres

# Run migrations
gitpod automations task start migrate

# Start all services
gitpod automations service start api ui worker

# Run validation
gitpod automations task start validate
```

## Troubleshooting

### Clone Fails

If cloning fails, ensure:
- Repositories are **public** (or you have SSH keys configured)
- Repository names match exactly
- GitHub username is correct in setup.sh

### Repositories Not Found

Check the setup script output:
```bash
cat /tmp/devcontainer-setup.log
```

### Permission Denied

If using private repositories, you need to:
1. Add SSH keys to your GitHub account
2. Use SSH URLs instead of HTTPS in setup.sh

## Alternative: Private Repositories

For private repositories, update setup.sh to use SSH:

```bash
PAYMENTS_UI_REPO="git@github.com:${GITHUB_USER}/payments-ui.git"
RECON_WORKER_REPO="git@github.com:${GITHUB_USER}/recon-worker.git"
```

And ensure your SSH keys are configured in Ona/Gitpod.

## Next Steps

Once repositories are set up on GitHub:

1. Share the `payments-api` repository URL with your team
2. Anyone opening it in Ona will get the complete multi-repo environment
3. All three repositories can be developed simultaneously
4. Changes can be committed and pushed independently

## Documentation

- [POV-GUIDE.md](./POV-GUIDE.md) - Comprehensive usage guide
- [README.md](./README.md) - Quick start guide
- [IMPLEMENTATION-SUMMARY.md](/workspaces/IMPLEMENTATION-SUMMARY.md) - Technical details
