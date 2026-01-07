#!/bin/bash

echo "🔍 Verifying Payments System Setup..."
echo ""

ERRORS=0

# Check repository structure
echo "📁 Checking repository structure..."

if [ ! -d "/workspaces/payments-api" ]; then
  echo "  ❌ payments-api repository not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ payments-api repository exists"
fi

if [ ! -d "/workspaces/recon-worker" ]; then
  echo "  ❌ recon-worker repository not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ recon-worker repository exists"
fi

if [ ! -d "/workspaces/payments-ui" ]; then
  echo "  ❌ payments-ui repository not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ payments-ui repository exists"
fi

echo ""

# Check key files
echo "📄 Checking key configuration files..."

if [ ! -f "/workspaces/payments-api/.devcontainer/devcontainer.json" ]; then
  echo "  ❌ devcontainer.json not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ devcontainer.json exists"
fi

if [ ! -f "/workspaces/payments-api/.ona/automations.yaml" ]; then
  echo "  ❌ automations.yaml not found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✅ automations.yaml exists"
fi

echo ""

# Check source files
echo "💻 Checking source files..."

API_FILES=(
  "/workspaces/payments-api/src/index.ts"
  "/workspaces/payments-api/src/db.ts"
  "/workspaces/payments-api/src/migrate.ts"
  "/workspaces/payments-api/src/validate.ts"
)

for file in "${API_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ❌ $(basename $file) not found"
    ERRORS=$((ERRORS + 1))
  fi
done

WORKER_FILES=(
  "/workspaces/recon-worker/src/index.ts"
  "/workspaces/recon-worker/src/db.ts"
  "/workspaces/recon-worker/src/reconcile.ts"
)

for file in "${WORKER_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ❌ $(basename $file) not found"
    ERRORS=$((ERRORS + 1))
  fi
done

UI_FILES=(
  "/workspaces/payments-ui/app/page.tsx"
  "/workspaces/payments-ui/app/layout.tsx"
  "/workspaces/payments-ui/app/payments/[id]/page.tsx"
  "/workspaces/payments-ui/app/accounts/[accountId]/page.tsx"
)

for file in "${UI_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "  ❌ $(basename $file) not found"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ All source files present"
fi

echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ]; then
  echo "✅ SETUP VERIFICATION PASSED"
  echo ""
  echo "Next steps:"
  echo "  1. Install dependencies: gitpod automations task start install-deps"
  echo "  2. Start Postgres: gitpod automations service start postgres"
  echo "  3. Run migrations: gitpod automations task start migrate"
  echo "  4. Start services: gitpod automations service start api ui worker"
  echo "  5. Run validation: gitpod automations task start validate"
  echo "  6. Open UI: http://localhost:3000"
else
  echo "❌ SETUP VERIFICATION FAILED"
  echo ""
  echo "Found $ERRORS error(s). Please review the output above."
fi
echo "═══════════════════════════════════════════════════════"
