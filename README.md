# Payments API

Payment processing API with Postgres persistence and job queue management.

## Endpoints

- `POST /payments` - Create a payment (requires `Idempotency-Key` header)
- `GET /payments` - List all payments
- `GET /payments/:id` - Get payment details with reconciliation status
- `GET /accounts/:accountId/balance` - Get account balance
- `GET /health` - Health check

## Database Schema

- `payments` - Payment records
- `recon_jobs` - Reconciliation job queue
- `reconciliation_results` - Reconciliation outcomes
- `ledger_entries` - Account ledger with running balance

## Development

This is the orchestrator repository. Opening it in Ona will:
- Clone `payments-ui` and `recon-worker` into the workspace
- Start Postgres
- Run migrations
- Start all services (API, UI, Worker)

## Validation

Run end-to-end validation:

```bash
npm run validate
```
