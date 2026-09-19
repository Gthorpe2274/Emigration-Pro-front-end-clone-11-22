import assert from 'node:assert/strict';
import test from 'node:test';

import worker from '../src/worker/index.ts';
import { CountryData } from '../src/shared/types.ts';

interface RecordedStatement {
  sql: string;
  args: unknown[];
}

/**
 * Minimal D1 stand-in: records every statement the audit code issues and answers
 * the two lookups the monthly run needs (the new run id, and its item counts).
 */
const createFakeDb = () => {
  const statements: RecordedStatement[] = [];
  const seeded: string[] = [];

  const db = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          statements.push({ sql, args });
          if (/INSERT OR IGNORE INTO immigration_audit_items/i.test(sql)) {
            seeded.push(String(args[1]));
          }
          return {
            run: async () => ({ meta: { changes: 1 } }),
            first: async () => (/FROM immigration_audit_runs/i.test(sql) ? { id: 1 } : null),
            all: async () => ({ results: [] }),
          };
        },
      };
    },
    batch: async (items: unknown[]) => items,
  };

  return { db, statements, seeded };
};

const createFakeQueue = () => {
  const batches: { body: { runId: number; country: string; priority: string } }[][] = [];
  return {
    batches,
    queue: {
      send: async () => undefined,
      sendBatch: async (messages: { body: { runId: number; country: string; priority: string } }[]) => {
        batches.push(messages);
        return undefined;
      },
    },
  };
};

const createFakeCtx = () => {
  const pending: Promise<unknown>[] = [];
  return { pending, ctx: { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as ExecutionContext };
};

test('monthly cron seeds every catalog destination and enqueues one audit message each', async () => {
  const { db, statements, seeded } = createFakeDb();
  const { queue, batches } = createFakeQueue();
  const { ctx, pending } = createFakeCtx();

  const env = { DB: db, IMMIGRATION_AUDIT_QUEUE: queue } as unknown as Env;
  const event = { cron: '0 4 1 * *', scheduledTime: Date.UTC(2026, 8, 1, 4, 0, 0) } as ScheduledEvent;

  await worker.scheduled(event, env, ctx);
  await Promise.all(pending);

  const messages = batches.flat();
  assert.equal(messages.length, CountryData.countries.length);
  assert.deepEqual(
    messages.map(message => message.body.country).sort(),
    [...CountryData.countries].sort(),
  );
  assert.ok(messages.every(message => message.body.runId === 1));
  assert.ok(messages.every(message => message.body.priority === 'monthly'));

  assert.ok(
    statements.some(entry =>
      /UPDATE immigration_audit_runs/i.test(entry.sql) && /SET status = 'queued'/i.test(entry.sql)),
    'the run should be marked queued once its items are enqueued',
  );
  assert.deepEqual(
    seeded.sort(),
    [...CountryData.countries].sort(),
    'every catalog destination should get exactly one audit item',
  );
});

test('the worker exposes a queue consumer so the audit queue can bind to it', async () => {
  const { db, statements } = createFakeDb();
  const { queue } = createFakeQueue();
  const env = { DB: db, IMMIGRATION_AUDIT_QUEUE: queue } as unknown as Env;

  assert.equal(typeof worker.queue, 'function');

  const acked: string[] = [];
  const batch = {
    queue: 'immigration-audit',
    messages: [{
      id: 'msg-1',
      timestamp: new Date(),
      attempts: 1,
      body: { runId: 'not-a-number' },
      ack: () => acked.push('msg-1'),
      retry: () => { throw new Error('a malformed message must not be retried'); },
    }],
  } as unknown as MessageBatch<never>;

  await worker.queue(batch, env, {} as ExecutionContext);

  assert.deepEqual(acked, ['msg-1']);
  assert.equal(
    statements.length,
    0,
    'a malformed message must be acknowledged without touching the database',
  );
});

test('unrecognised crons are ignored instead of throwing', async () => {
  const { db } = createFakeDb();
  const { queue } = createFakeQueue();
  const { ctx, pending } = createFakeCtx();
  const env = { DB: db, IMMIGRATION_AUDIT_QUEUE: queue } as unknown as Env;

  await worker.scheduled({ cron: '0 9 9 9 9', scheduledTime: Date.now() } as ScheduledEvent, env, ctx);
  await Promise.all(pending);
});
