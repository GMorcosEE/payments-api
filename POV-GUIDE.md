# Enterprise Payment System - Proof of Value Guide

This is a synthetic, enterprise-grade application demonstrating Ona/Gitpod's capability to support single-environment, multi-repository development with meaningful integration complexity.

## Architecture Overview

### Three-Repository Structure

1. **payments-api** (Orchestrator)
   - Node.js + TypeScript + Fastify
   - REST API with idempotent payment creation
   - Postgres persistence layer
   - Job queue management
   - Entry point for the entire system

2. **recon-worker**
   - Background worker for payment reconciliation
   - Postgres-backed job queue using `SELECT FOR UPDATE SKIP LOCKED`
   - Deterministic reconciliation rules
   - Ledger entry creation with running balance

3. **payments-ui**
   - Next.js + TypeScript
   - Payment creation interface
   - Real-time status updates
   - Reconciliation result display
   - Account balance view

### Database Schema

**payments**
- Payment records with idempotency keys
- Status tracking (pending → completed/failed)
- Account association

**recon_jobs**
- Job queue for reconciliation tasks
- Lock management for distributed processing
- Retry tracking

**reconciliation_results**
- Reconciliation outcomes
- Match status and discrepancy tracking
- Audit trail

**ledger_entries**
- Double-entry accounting ledger
- Running balance calculation
- Payment association

## Getting Started

### Opening in Ona

1. Open the `payments-api` repository in Ona
2. The devcontainer will automatically:
   - Clone `payments-ui` and `recon-worker` into `/workspaces/`
   - Configure the development environment
3. Use Ona automations to start services

### Starting Services

```bash
# Install dependencies across all repos
gitpod automations task start install-deps

# Start Postgres
gitpod automations service start postgres

# Run migrations
gitpod automations task start migrate

# Start all services
gitpod automations service start api
gitpod automations service start ui
gitpod automations service start worker
```

### Accessing the System

- **UI**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3001](http://localhost:3001)
- **API Health**: [http://localhost:3001/health](http://localhost:3001/health)

## End-to-End Validation

Run the validation script to verify the complete system:

```bash
gitpod automations task start validate
```

This will:
1. Create a payment via the API
2. Confirm persistence in Postgres
3. Verify reconciliation job creation
4. Wait for worker to process the job
5. Confirm ledger entry creation
6. Verify balance endpoint accuracy
7. Test idempotency

Expected output:
```
✅ ALL VALIDATION CHECKS PASSED

Summary:
  • Payment creation: ✅
  • Database persistence: ✅
  • Job queue: ✅
  • Worker processing: ✅
  • Ledger updates: ✅
  • Balance endpoint: ✅
  • Idempotency: ✅
```

## Key Features Demonstrated

### 1. Multi-Repository Orchestration

Opening one repository brings up three related codebases in a single workspace, demonstrating:
- Automatic repository cloning
- Shared development environment
- Cross-repository changes in one session

### 2. Service Dependencies

Services start in the correct order:
- Postgres → API → UI
- Postgres → Worker

### 3. Real Integration Complexity

- HTTP API communication
- Database transactions
- Background job processing
- Distributed locking
- Idempotency handling
- Running balance calculation

### 4. Deterministic Behavior

Reconciliation rules are predictable:
- Negative amounts: Failed
- Zero amounts: Failed
- Amounts ending in .13: Completed with discrepancy
- All other amounts: Successfully reconciled

### 5. Developer Experience

- No manual setup required
- Consistent environment across developers
- Real-time UI updates
- Comprehensive validation

## Making Cross-Repository Changes

### Example: Adding a New Payment Status

1. **Update API** (`payments-api/src/index.ts`)
   - Add new status handling

2. **Update Worker** (`recon-worker/src/reconcile.ts`)
   - Add reconciliation logic for new status

3. **Update UI** (`payments-ui/app/page.tsx`)
   - Add UI representation for new status

4. **Test End-to-End**
   - Create payment with new status
   - Verify worker processes correctly
   - Confirm UI displays properly

All changes happen in the same workspace, with immediate feedback.

## API Reference

### Create Payment
```bash
POST /payments
Headers:
  Idempotency-Key: unique-key
  Content-Type: application/json
Body:
  {
    "accountId": "ACC-001",
    "amount": 100.00,
    "description": "Payment description"
  }
```

### List Payments
```bash
GET /payments
```

### Get Payment Details
```bash
GET /payments/{id}
```

### Get Account Balance
```bash
GET /accounts/{accountId}/balance
```

## Troubleshooting

### Services Not Starting

Check service status:
```bash
gitpod automations service list
```

View service logs:
```bash
gitpod automations service logs postgres
gitpod automations service logs api
gitpod automations service logs worker
```

### Database Connection Issues

Verify Postgres is running:
```bash
pg_isready -h localhost -p 5432 -U postgres
```

### Worker Not Processing Jobs

Check worker logs:
```bash
gitpod automations service logs worker
```

Verify jobs exist:
```bash
psql -h localhost -U postgres -d payments -c "SELECT * FROM recon_jobs WHERE status = 'pending';"
```

## Value Proposition

This PoV demonstrates:

✅ **Single-Environment, Multi-Repo Development**
- One workspace, three repositories
- No manual cloning or setup

✅ **Realistic Integration Complexity**
- HTTP APIs, databases, background workers
- Real-world patterns (idempotency, job queues, ledgers)

✅ **Deterministic and Reproducible**
- Same result every time
- Consistent across developers

✅ **Production-Like Architecture**
- Service dependencies
- Database transactions
- Distributed processing

✅ **Developer Productivity**
- Instant environment setup
- Cross-repo changes in one session
- Comprehensive validation

This is not a toy app. It's a realistic demonstration of how Ona/Gitpod enables efficient development of complex, multi-repository systems.
