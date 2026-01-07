import { query, pool } from './db';

const API_URL = 'http://localhost:3001';
const TEST_ACCOUNT = 'ACC-VALIDATE-001';
const TEST_AMOUNT = 250.00;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function validateSystem() {
  console.log('🧪 Starting end-to-end validation...\n');

  try {
    console.log('Step 1: Creating payment via API...');
    const idempotencyKey = `validate-${Date.now()}`;
    const createResponse = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        accountId: TEST_ACCOUNT,
        amount: TEST_AMOUNT,
        description: 'Validation test payment',
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create payment: ${createResponse.statusText}`);
    }

    const payment = await createResponse.json();
    console.log(`✅ Payment created: ${payment.id}`);
    console.log(`   Amount: $${payment.amount}`);
    console.log(`   Status: ${payment.status}\n`);

    console.log('Step 2: Confirming payment is persisted...');
    const paymentCheck = await query('SELECT * FROM payments WHERE id = $1', [payment.id]);
    if (paymentCheck.rows.length === 0) {
      throw new Error('Payment not found in database');
    }
    console.log(`✅ Payment persisted in database\n`);

    console.log('Step 3: Confirming reconciliation job was created...');
    const jobCheck = await query('SELECT * FROM recon_jobs WHERE payment_id = $1', [payment.id]);
    if (jobCheck.rows.length === 0) {
      throw new Error('Reconciliation job not found');
    }
    console.log(`✅ Reconciliation job created: ${jobCheck.rows[0].id}\n`);

    console.log('Step 4: Waiting for worker to process job (max 30 seconds)...');
    let reconResult = null;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      const result = await query(
        'SELECT * FROM reconciliation_results WHERE payment_id = $1',
        [payment.id]
      );

      if (result.rows.length > 0) {
        reconResult = result.rows[0];
        break;
      }

      await sleep(1000);
      attempts++;
      process.stdout.write('.');
    }

    console.log('\n');

    if (!reconResult) {
      throw new Error('Reconciliation did not complete within timeout');
    }

    console.log(`✅ Reconciliation completed`);
    console.log(`   Status: ${reconResult.status}`);
    console.log(`   Matched: ${reconResult.matched}`);
    console.log(`   Notes: ${reconResult.notes}\n`);

    console.log('Step 5: Confirming ledger entry was created...');
    const ledgerCheck = await query(
      'SELECT * FROM ledger_entries WHERE payment_id = $1',
      [payment.id]
    );

    if (ledgerCheck.rows.length === 0) {
      throw new Error('Ledger entry not found');
    }

    const ledgerEntry = ledgerCheck.rows[0];
    console.log(`✅ Ledger entry created`);
    console.log(`   Entry type: ${ledgerEntry.entry_type}`);
    console.log(`   Amount: $${ledgerEntry.amount}`);
    console.log(`   Balance after: $${ledgerEntry.balance_after}\n`);

    console.log('Step 6: Confirming balance endpoint returns correct value...');
    const balanceResponse = await fetch(`${API_URL}/accounts/${TEST_ACCOUNT}/balance`);

    if (!balanceResponse.ok) {
      throw new Error(`Failed to fetch balance: ${balanceResponse.statusText}`);
    }

    const balanceData = await balanceResponse.json();
    console.log(`✅ Balance endpoint working`);
    console.log(`   Account: ${balanceData.accountId}`);
    console.log(`   Balance: $${balanceData.balance}`);
    console.log(`   Currency: ${balanceData.currency}\n`);

    if (balanceData.balance !== ledgerEntry.balance_after) {
      throw new Error(
        `Balance mismatch: API returned ${balanceData.balance}, ledger shows ${ledgerEntry.balance_after}`
      );
    }

    console.log('✅ Balance matches ledger entry\n');

    console.log('Step 7: Testing idempotency...');
    const idempotentResponse = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify({
        accountId: TEST_ACCOUNT,
        amount: TEST_AMOUNT,
        description: 'Validation test payment',
      }),
    });

    const idempotentPayment = await idempotentResponse.json();
    if (idempotentPayment.id !== payment.id) {
      throw new Error('Idempotency check failed: different payment returned');
    }

    console.log(`✅ Idempotency working correctly\n`);

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ ALL VALIDATION CHECKS PASSED');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('Summary:');
    console.log('  • Payment creation: ✅');
    console.log('  • Database persistence: ✅');
    console.log('  • Job queue: ✅');
    console.log('  • Worker processing: ✅');
    console.log('  • Ledger updates: ✅');
    console.log('  • Balance endpoint: ✅');
    console.log('  • Idempotency: ✅');
    console.log('');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ VALIDATION FAILED:', error);
    await pool.end();
    process.exit(1);
  }
}

validateSystem();
