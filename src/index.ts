import Fastify from 'fastify';
import cors from '@fastify/cors';
import { query } from './db';

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: true,
});

interface CreatePaymentBody {
  accountId: string;
  amount: number;
  currency?: string;
  description?: string;
}

fastify.post<{ Body: CreatePaymentBody; Headers: { 'idempotency-key': string } }>(
  '/payments',
  async (request, reply) => {
    const { accountId, amount, currency = 'USD', description } = request.body;
    const idempotencyKey = request.headers['idempotency-key'];

    if (!idempotencyKey) {
      return reply.code(400).send({ error: 'Idempotency-Key header is required' });
    }

    if (!accountId || amount === undefined) {
      return reply.code(400).send({ error: 'accountId and amount are required' });
    }

    const existingPayment = await query(
      'SELECT * FROM payments WHERE idempotency_key = $1',
      [idempotencyKey]
    );

    if (existingPayment.rows.length > 0) {
      return reply.code(200).send(existingPayment.rows[0]);
    }

    const result = await query(
      `INSERT INTO payments (idempotency_key, account_id, amount, currency, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [idempotencyKey, accountId, amount, currency, description]
    );

    const payment = result.rows[0];

    await query(
      `INSERT INTO recon_jobs (payment_id, status)
       VALUES ($1, 'pending')`,
      [payment.id]
    );

    return reply.code(201).send(payment);
  }
);

fastify.get('/payments', async (request, reply) => {
  const result = await query(
    'SELECT * FROM payments ORDER BY created_at DESC'
  );
  return reply.send(result.rows);
});

fastify.get<{ Params: { id: string } }>('/payments/:id', async (request, reply) => {
  const { id } = request.params;

  const paymentResult = await query('SELECT * FROM payments WHERE id = $1', [id]);

  if (paymentResult.rows.length === 0) {
    return reply.code(404).send({ error: 'Payment not found' });
  }

  const reconResult = await query(
    'SELECT * FROM reconciliation_results WHERE payment_id = $1',
    [id]
  );

  return reply.send({
    payment: paymentResult.rows[0],
    reconciliation: reconResult.rows[0] || null,
  });
});

fastify.get<{ Params: { accountId: string } }>(
  '/accounts/:accountId/balance',
  async (request, reply) => {
    const { accountId } = request.params;

    const result = await query(
      `SELECT balance_after FROM ledger_entries
       WHERE account_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [accountId]
    );

    const balance = result.rows.length > 0 ? result.rows[0].balance_after : '0.00';

    return reply.send({
      accountId,
      balance,
      currency: 'USD',
    });
  }
);

fastify.get('/health', async (request, reply) => {
  return reply.send({ status: 'ok' });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`✅ Payments API listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
