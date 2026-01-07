# Payments API (Orchestrator Repository)

**Main repository for the enterprise payment processing system.** Opening this repository in Ona automatically sets up a complete multi-repository development environment.

## 🏗️ Multi-Repository Architecture

This system demonstrates single-environment, multi-repository development:

- **payments-api** (this repo) - Fastify REST API, Postgres schema, migrations, validation
- **payments-ui** - Next.js interface (auto-cloned)
- **recon-worker** - Background reconciliation worker (auto-cloned)

## 🚀 Quick Start

1. Open this repository in Ona
2. Everything starts automatically:
   - Clones `payments-ui` and `recon-worker` into `/workspaces/`
   - Installs dependencies across all repos
   - Starts PostgreSQL database
   - Runs database migrations
   - Starts all services (API, UI, Worker)
3. Access the Payments UI on port 3000 (automatically exposed)
   - API and database run internally on localhost
4. Run validation (optional):
   ```bash
   ona automations task start validate
   ```

## 🔧 Managing Services

Services start automatically, but you can control them manually:

```bash
# View service status
ona automations service list

# View service logs
ona automations service logs api
ona automations service logs ui
ona automations service logs worker

# Restart a service
ona automations service stop api
ona automations service start api
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

Run validation using either command:

```bash
# Using Ona automations
ona automations task start validate

# Or directly with npm
npm run validate
```

## 🔗 Related Repositories

- [payments-ui](https://github.com/GMorcosEE/payments-ui) - Next.js UI
- [recon-worker](https://github.com/GMorcosEE/recon-worker) - Background worker

## 📚 Documentation

See [POV-GUIDE.md](./POV-GUIDE.md) for comprehensive documentation.
