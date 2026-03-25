/**
 * Tests for GET /api/cron/streaks
 *
 * Covers:
 *   - 401 when Authorization header is missing or wrong
 *   - 500 when DB fetch fails
 *   - No-op when there are no stale rows
 *   - Shield consumed when shield_active=true and last_review_date === twoDaysAgo
 *   - Streak reset when shield is inactive and current_streak > 0
 *   - Row with shield_active=true but last_review_date older than two days ago → reset (not consume)
 *   - Row with current_streak=0 → skipped entirely (no update)
 *   - Mixed rows → correct shieldConsumed + streaksReset counts
 *   - Response always contains processed, shieldConsumed, streaksReset, date
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/streaks/route';

// ─── Date helpers ─────────────────────────────────────────────────────────────

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

const TODAY_STR       = dateStr(0);
const YESTERDAY_STR   = dateStr(1);
const TWO_DAYS_AGO    = dateStr(2);
const THREE_DAYS_AGO  = dateStr(3);

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockUpdateEq   = jest.fn().mockResolvedValue({ error: null });
const mockUpdateChain = { eq: mockUpdateEq };
const mockUpdate      = jest.fn().mockReturnValue(mockUpdateChain);

function makeSelectChain(data: unknown[], error: unknown = null) {
  return {
    select: jest.fn().mockReturnValue({
      lt: jest.fn().mockResolvedValue({ data, error }),
    }),
  };
}

jest.mock('@/app/lib/admin', () => ({
  getServiceSupabase: jest.fn(),
}));

import { getServiceSupabase } from '@/app/lib/admin';

// ─── Request factory ──────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['authorization'] = `Bearer ${secret}`;
  return new NextRequest('http://localhost/api/cron/streaks', { headers });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/cron/streaks', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateEq.mockResolvedValue({ error: null });
    mockUpdate.mockReturnValue(mockUpdateChain);
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

  it('returns 401 when Authorization header has the wrong secret', async () => {
    const res = await GET(makeRequest('wrong'));
    expect(res.status).toBe(401);
  });

  it('proceeds when Authorization header matches CRON_SECRET', async () => {
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([])),
    });
    const res = await GET(makeRequest('test-secret'));
    expect(res.status).not.toBe(401);
  });

  it('proceeds without auth check when CRON_SECRET env var is not set', async () => {
    delete process.env.CRON_SECRET;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([])),
    });
    const res = await GET(makeRequest()); // no header
    expect(res.status).not.toBe(401);
  });

  // ── DB error ─────────────────────────────────────────────────────────────────

  it('returns 500 when the DB select fails', async () => {
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([], { message: 'connection refused' })),
    });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('connection refused');
  });

  // ── No stale rows ─────────────────────────────────────────────────────────────

  it('returns ok with zero counts when there are no stale rows', async () => {
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([])),
    });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.processed).toBe(0);
    expect(body.shieldConsumed).toBe(0);
    expect(body.streaksReset).toBe(0);
    expect(body.date).toBe(TODAY_STR);
  });

  // ── Shield consumption ────────────────────────────────────────────────────────

  it('consumes shield when shield_active=true and last_review_date is exactly two days ago', async () => {
    const row = {
      user_id: 'user-1',
      current_streak: 5,
      shield_active: true,
      last_review_date: TWO_DAYS_AGO,
    };

    let call = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeSelectChain([row]);
        return { update: mockUpdate };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.shieldConsumed).toBe(1);
    expect(body.streaksReset).toBe(0);
    expect(body.processed).toBe(1);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ shield_active: false })
    );
    expect(mockUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({ current_streak: 0 })
    );
    expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-1');
  });

  // ── Streak reset ──────────────────────────────────────────────────────────────

  it('resets streak when shield is inactive and current_streak > 0', async () => {
    const row = {
      user_id: 'user-2',
      current_streak: 7,
      shield_active: false,
      last_review_date: TWO_DAYS_AGO,
    };

    let call = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeSelectChain([row]);
        return { update: mockUpdate };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(body.streaksReset).toBe(1);
    expect(body.shieldConsumed).toBe(0);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ current_streak: 0, shield_active: false })
    );
    expect(mockUpdateEq).toHaveBeenCalledWith('user_id', 'user-2');
  });

  it('resets streak when shield_active=true but last_review_date is older than two days ago', async () => {
    const row = {
      user_id: 'user-3',
      current_streak: 3,
      shield_active: true,
      last_review_date: THREE_DAYS_AGO,
    };

    let call = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeSelectChain([row]);
        return { update: mockUpdate };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(body.streaksReset).toBe(1);
    expect(body.shieldConsumed).toBe(0);
  });

  // ── Zero-streak rows ──────────────────────────────────────────────────────────

  it('skips rows where current_streak is already 0 and shield is inactive', async () => {
    const row = {
      user_id: 'user-4',
      current_streak: 0,
      shield_active: false,
      last_review_date: THREE_DAYS_AGO,
    };

    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([row])),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(body.processed).toBe(1);
    expect(body.streaksReset).toBe(0);
    expect(body.shieldConsumed).toBe(0);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  // ── Mixed rows ────────────────────────────────────────────────────────────────

  it('correctly counts shieldConsumed and streaksReset across mixed rows', async () => {
    const rows = [
      { user_id: 'u1', current_streak: 5, shield_active: true,  last_review_date: TWO_DAYS_AGO   },
      { user_id: 'u2', current_streak: 3, shield_active: false, last_review_date: THREE_DAYS_AGO },
      { user_id: 'u3', current_streak: 2, shield_active: true,  last_review_date: THREE_DAYS_AGO },
      { user_id: 'u4', current_streak: 0, shield_active: false, last_review_date: THREE_DAYS_AGO },
    ];

    let call = 0;
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockImplementation(() => {
        call++;
        if (call === 1) return makeSelectChain(rows);
        return { update: mockUpdate };
      }),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(body.processed).toBe(4);
    expect(body.shieldConsumed).toBe(1);
    expect(body.streaksReset).toBe(2);
  });

  // ── Response shape ────────────────────────────────────────────────────────────

  it('always returns ok, processed, shieldConsumed, streaksReset, and date fields', async () => {
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue(makeSelectChain([])),
    });

    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();

    expect(body).toHaveProperty('ok', true);
    expect(body).toHaveProperty('processed');
    expect(body).toHaveProperty('shieldConsumed');
    expect(body).toHaveProperty('streaksReset');
    expect(body).toHaveProperty('date');
  });

  it('fetches rows where last_review_date is strictly before yesterday', async () => {
    const ltMock = jest.fn().mockResolvedValue({ data: [], error: null });
    (getServiceSupabase as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({ lt: ltMock }),
      }),
    });

    await GET(makeRequest('test-secret'));

    expect(ltMock).toHaveBeenCalledWith('last_review_date', YESTERDAY_STR);
  });
});
