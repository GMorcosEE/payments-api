import { pool } from './db';

async function migrate() {
  console.log('Running database migrations...');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      idempotency_key VARCHAR(255) UNIQUE NOT NULL,
      account_id VARCHAR(255) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'USD',
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      description TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_account_id ON payments(account_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_payments_idempotency_key ON payments(idempotency_key);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recon_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payment_id UUID NOT NULL REFERENCES payments(id),
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      attempts INT NOT NULL DEFAULT 0,
      locked_at TIMESTAMP,
      locked_by VARCHAR(255),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_recon_jobs_status ON recon_jobs(status);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reconciliation_results (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payment_id UUID NOT NULL REFERENCES payments(id),
      recon_job_id UUID NOT NULL REFERENCES recon_jobs(id),
      status VARCHAR(50) NOT NULL,
      matched BOOLEAN NOT NULL,
      discrepancy_amount DECIMAL(15, 2),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_reconciliation_results_payment_id ON reconciliation_results(payment_id);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_id VARCHAR(255) NOT NULL,
      payment_id UUID NOT NULL REFERENCES payments(id),
      entry_type VARCHAR(50) NOT NULL,
      amount DECIMAL(15, 2) NOT NULL,
      balance_after DECIMAL(15, 2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_ledger_entries_account_id ON ledger_entries(account_id);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_ledger_entries_payment_id ON ledger_entries(payment_id);
  `);

  console.log('✅ Migrations completed successfully');
  await pool.end();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
