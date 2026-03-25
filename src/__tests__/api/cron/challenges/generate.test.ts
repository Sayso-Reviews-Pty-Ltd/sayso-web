/**
 * Tests for GET /api/cron/challenges/generate
 *
 * Covers:
 *   - 401 when Authorization header does not match CRON_SECRET
 *   - Skips insertion when 3+ active challenges already exist for the week
 *   - Deactivates challenges whose ends_at is before this Monday
 *   - Inserts exactly 3 challenges drawn from CHALLENGE_POOL
 *   - Each inserted challenge carries the correct shape and date window
 *   - 500 is returned when the DB insert fails
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/challenges/generate/route';

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockUpdate = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();

// Builder pattern: each method returns the builder so the chain resolves cleanly.
// The terminal call (lt / gte / select after insert) returns a Promise-like value.
function makeQueryBuilder(terminal: () => Promise<unknown>) {
  const builder: Record<string, jest.Mock> = {};
  builder.update  = jest.fn(() => builder);
  builder.lt      = jest.fn(() => terminal());
  builder.select  = jest.fn(() => builder);
  builder.eq      = jest.fn(() => builder);
  builder.gte     = jest.fn(() => terminal());
  builder.insert  = jest.fn(() => builder);
  // Allow .insert().select() to resolve too
  // Re-attach select so it returns the terminal when called after insert
  builder.insert.mockImplementation(() => {
    const insertBuilder: Record<string, jest.Mock> = {};
    insertBuilder.select = jest.fn(() => terminal());
    return insertBuilder;
  });
  return builder;
}

jest.mock('@/app/lib/admin', () => ({
  getServiceSupabase: jest.fn(),
}));

import { getServiceSupabase } from '@/app/lib/admin';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['authorization'] = `Bearer ${secret}`;
  return new NextRequest('http://localhost/api/cron/challenges/generate', { headers });
}

/** Returns a Monday at midnight for the current week. */
function currentMonday(): Date {
  const now  = new Date();
  const day  = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const mon  = new Date(now);
  mon.setDate(now.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/cron/challenges/generate', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...ORIGINAL_ENV, CRON_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── Auth ────────────────────────────────────────────────────────────────────

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('returns 401 when Authorization header has wrong secret', async () => {
    const res = await GET(makeRequest('wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('proceeds when Authorization header matches CRON_SECRET', async () => {
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(
        makeQueryBuilder(() => Promise.resolve({ data: [], error: null }))
      ),
    });

    // Should NOT return 401
    const res = await GET(makeRequest('test-secret'));
    expect(res.status).not.toBe(401);
  });

  it('proceeds without auth check when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;

    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(
        makeQueryBuilder(() => Promise.resolve({ data: [], error: null }))
      ),
    });

    const res = await GET(makeRequest()); // no auth header
    expect(res.status).not.toBe(401);
  });

  // ── Idempotency ─────────────────────────────────────────────────────────────

  it('skips insertion and returns skipped:true when 3 active challenges already exist', async () => {
    const existingChallenges = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        // 1st call → deactivate (update + lt) → no data needed
        // 2nd call → select existing → return 3 rows
        const terminal = callCount === 1
          ? () => Promise.resolve({ data: null, error: null })
          : () => Promise.resolve({ data: existingChallenges, error: null });
        return makeQueryBuilder(terminal);
      }),
    });

    const res = await GET(makeRequest('test-secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.skipped).toBe(true);
    expect(body.reason).toMatch(/already generated/i);
  });

  it('skips insertion when more than 3 active challenges exist', async () => {
    const existingChallenges = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        const terminal = callCount === 1
          ? () => Promise.resolve({ data: null, error: null })
          : () => Promise.resolve({ data: existingChallenges, error: null });
        return makeQueryBuilder(terminal);
      }),
    });

    const res = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(body.skipped).toBe(true);
  });

  // ── Deactivation ────────────────────────────────────────────────────────────

  it('calls update({ is_active: false }).lt(ends_at, <monday>) to deactivate stale challenges', async () => {
    const updateChain = { lt: jest.fn().mockResolvedValue({ data: null, error: null }) };
    const updateMock  = jest.fn().mockReturnValue(updateChain);

    let fromCallCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        fromCallCount++;
        if (fromCallCount === 1) {
          // deactivation call
          return { update: updateMock };
        }
        // subsequent calls — return empty so we hit the insert path
        return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
      }),
    });

    // Stub the insert call on the 3rd from() invocation
    let insertCallCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        insertCallCount++;
        if (insertCallCount === 1) return { update: updateMock };
        if (insertCallCount === 2) {
          return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
        }
        // insert call
        return {
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue({ data: [{ id: '1', title: 'T' }], error: null }),
          }),
        };
      }),
    });

    await GET(makeRequest('test-secret'));

    expect(updateMock).toHaveBeenCalledWith({ is_active: false });
    const ltArg = updateChain.lt.mock.calls[0];
    expect(ltArg[0]).toBe('ends_at');
    // The second arg should be a valid ISO string falling on a Monday
    const passedDate = new Date(ltArg[1]);
    expect(passedDate.getDay()).toBe(1); // Monday
    expect(passedDate.getHours()).toBe(0);
  });

  // ── Insertion ───────────────────────────────────────────────────────────────

  it('inserts exactly 3 challenges when none exist for the week', async () => {
    const insertedRows = [
      { id: 'x1', title: 'Challenge A' },
      { id: 'x2', title: 'Challenge B' },
      { id: 'x3', title: 'Challenge C' },
    ];
    const insertSelectMock = jest.fn().mockResolvedValue({ data: insertedRows, error: null });
    const insertMock       = jest.fn().mockReturnValue({ select: insertSelectMock });

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // deactivate
          return { update: jest.fn().mockReturnValue({ lt: jest.fn().mockResolvedValue({}) }) };
        }
        if (callCount === 2) {
          // check existing → none
          return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
        }
        // insert
        return { insert: insertMock };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.inserted).toBe(3);
    expect(body.challenges).toHaveLength(3);

    // Verify 3 rows were passed to insert
    const insertArg: unknown[] = insertMock.mock.calls[0][0];
    expect(insertArg).toHaveLength(3);
  });

  it('each inserted row has the expected shape', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: '1', title: 'T' }, { id: '2', title: 'U' }, { id: '3', title: 'V' }],
        error: null,
      }),
    });

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: jest.fn().mockReturnValue({ lt: jest.fn().mockResolvedValue({}) }) };
        if (callCount === 2) return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
        return { insert: insertMock };
      }),
    });

    await GET(makeRequest('test-secret'));

    const rows: Record<string, unknown>[] = insertMock.mock.calls[0][0];
    const monday = currentMonday();

    for (const row of rows) {
      expect(row).toHaveProperty('title');
      expect(row).toHaveProperty('description');
      expect(row).toHaveProperty('rule_type');
      expect(row).toHaveProperty('target');
      expect(row).toHaveProperty('reward_xp');
      expect(row.is_active).toBe(true);

      // starts_at should be this Monday at 00:00
      const startsAt = new Date(row.starts_at as string);
      expect(startsAt.getDay()).toBe(1);
      expect(startsAt.getTime()).toBe(monday.getTime());

      // ends_at should be Sunday (6 days after Monday) at 23:59:59
      const endsAt = new Date(row.ends_at as string);
      expect(endsAt.getDay()).toBe(0); // Sunday
    }
  });

  it('only inserts rows from the known CHALLENGE_POOL titles', async () => {
    const POOL_TITLES = [
      'Share Your Taste', 'Beauty Scout', 'Snap & Share', 'Helpful Critic',
      'Explorer Week', 'Night Out', 'Health Check', 'Neighbourhood Watch',
      'Retail Therapy', 'Service Reporter',
    ];

    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    });

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: jest.fn().mockReturnValue({ lt: jest.fn().mockResolvedValue({}) }) };
        if (callCount === 2) return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
        return { insert: insertMock };
      }),
    });

    await GET(makeRequest('test-secret'));

    const rows: Record<string, unknown>[] = insertMock.mock.calls[0][0];
    for (const row of rows) {
      expect(POOL_TITLES).toContain(row.title);
    }
  });

  // ── DB error ─────────────────────────────────────────────────────────────────

  it('returns 500 when the DB insert fails', async () => {
    const insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB exploded' } }),
    });

    let callCount = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return { update: jest.fn().mockReturnValue({ lt: jest.fn().mockResolvedValue({}) }) };
        if (callCount === 2) return makeQueryBuilder(() => Promise.resolve({ data: [], error: null }));
        return { insert: insertMock };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('DB exploded');
  });
});
