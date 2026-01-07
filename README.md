# Payments API (Orchestrator Repository)

**Main repository for the enterprise payment processing system.** Opening this repository in Ona/Gitpod automatically sets up a complete multi-repository development environment.

## 🏗️ Multi-Repository Architecture

This system demonstrates single-environment, multi-repository development:

- **payments-api** (this repo) - Fastify REST API, Postgres schema, migrations, validation
- **payments-ui** - Next.js interface (auto-cloned)
- **recon-worker** - Background reconciliation worker (auto-cloned)

## 🚀 Quick Start

1. Open this repository in Ona/Gitpod
2. The devcontainer will automatically:
   - Clone `payments-ui` and `recon-worker` into `/workspaces/`
   - Install dependencies across all repos
   - Start Postgres
   - Run migrations
3. Start services:
   ```bash
   gitpod automations service start api ui worker
   ```
4. Run validation:
   ```bash
   gitpod automations task start validate
   ```

## 📡 API Endpoints

- `POST /payments` - Create payment (requires `Idempotency-Key` header)
- `GET /payments` - List all payments
- `GET /payments/:id` - Get payment with reconciliation status
- `GET /accounts/:accountId/balance` - Get account balance
- `GET /health` - Health check

## 🗄️ Database Schema

- `payments` - Payment records with idempotency
- `recon_jobs` - Postgres-backed job queue
- `reconciliation_results` - Reconciliation outcomes
- `ledger_entries` - Double-entry ledger with running balance

## ✅ Validation

End-to-end validation tests:
1. Payment creation via API
2. Database persistence
3. Job queue creation
4. Worker processing
5. Ledger entry creation
6. Balance endpoint accuracy
7. Idempotency

```bash
npm run validate
```

## 🔗 Related Repositories

- [payments-ui](https://github.com/YOUR_USERNAME/payments-ui) - Next.js UI
- [recon-worker](https://github.com/YOUR_USERNAME/recon-worker) - Background worker

## 📚 Documentation

See [POV-GUIDE.md](./POV-GUIDE.md) for comprehensive documentation.
