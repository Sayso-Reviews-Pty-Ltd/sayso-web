/**
 * Tests for GET /api/cron/cleanup-claim-docs
 *
 * Covers:
 *   - 401 when Authorization header is missing or wrong
 *   - Returns { ok: true, deleted_documents: 0 } when no expired docs
 *   - Deletes storage file for each doc that has a storage_path
 *   - Skips storage deletion for docs with null storage_path
 *   - Deletes the DB row for each expired doc
 *   - deleted_documents count matches the number of expired docs
 *   - Calls cleanup_expired_business_claim_otp RPC
 *   - Returns 500 on unexpected error
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/cron/cleanup-claim-docs/route';

// ─── Supabase mock ────────────────────────────────────────────────────────────

const mockRpc        = jest.fn().mockResolvedValue({ error: null });
const mockDeleteEq   = jest.fn().mockResolvedValue({ error: null });
const mockDeleteChain = { eq: mockDeleteEq };
const mockDelete     = jest.fn().mockReturnValue(mockDeleteChain);
const mockStorageRemove = jest.fn().mockResolvedValue({ error: null });
const mockStorageFrom   = jest.fn().mockReturnValue({ remove: mockStorageRemove });

function makeSelectChain(data: unknown[]) {
  return {
    select: jest.fn().mockReturnValue({
      lt: jest.fn().mockResolvedValue({ data, error: null }),
    }),
  };
}

jest.mock('@/app/lib/admin', () => ({
  getServiceSupabase: jest.fn(),
}));

import { getServiceSupabase } from '@/app/lib/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(secret?: string): NextRequest {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['authorization'] = `Bearer ${secret}`;
  return new NextRequest('http://localhost/api/cron/cleanup-claim-docs', { headers });
}

function makeDoc(id: string, storagePath: string | null = `claims/${id}.pdf`) {
  return { id, storage_path: storagePath };
}

function setupSupabase(docs: unknown[]) {
  let fromCall = 0;
  (getServiceSupabase as jest.Mock).mockReturnValue({
    from: jest.fn().mockImplementation(() => {
      fromCall++;
      if (fromCall === 1) return makeSelectChain(docs);
      return { delete: mockDelete };
    }),
    storage: { from: mockStorageFrom },
    rpc: mockRpc,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/cron/cleanup-claim-docs', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRpc.mockResolvedValue({ error: null });
    mockDeleteEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue(mockDeleteChain);
    mockStorageRemove.mockResolvedValue({ error: null });
    mockStorageFrom.mockReturnValue({ remove: mockStorageRemove });
    process.env = { ...ORIGINAL_ENV, CRON_SECRET: 'test-secret' };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  // ── Auth ────────────────────────────────────────────────────────────────────

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe('Unauthorized');
  });

  it('returns 401 when Authorization header has the wrong secret', async () => {
    const res = await GET(makeRequest('wrong'));
    expect(res.status).toBe(401);
  });

  it('proceeds when Authorization header matches CRON_SECRET', async () => {
    setupSupabase([]);
    const res = await GET(makeRequest('test-secret'));
    expect(res.status).not.toBe(401);
  });

  it('proceeds without auth when CRON_SECRET is not set', async () => {
    delete process.env.CRON_SECRET;
    setupSupabase([]);
    const res = await GET(makeRequest());
    expect(res.status).not.toBe(401);
  });

  // ── No expired docs ───────────────────────────────────────────────────────────

  it('returns ok with deleted_documents=0 when no expired docs exist', async () => {
    setupSupabase([]);
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.deleted_documents).toBe(0);
  });

  // ── Storage deletion ──────────────────────────────────────────────────────────

  it('deletes storage file for each doc that has a storage_path', async () => {
    setupSupabase([makeDoc('d1', 'claims/d1.pdf'), makeDoc('d2', 'claims/d2.pdf')]);
    await GET(makeRequest('test-secret'));
    expect(mockStorageFrom).toHaveBeenCalledWith('business-verification');
    expect(mockStorageRemove).toHaveBeenCalledWith(['claims/d1.pdf']);
    expect(mockStorageRemove).toHaveBeenCalledWith(['claims/d2.pdf']);
  });

  it('skips storage deletion when storage_path is null', async () => {
    setupSupabase([makeDoc('d1', null)]);
    await GET(makeRequest('test-secret'));
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  // ── DB row deletion ───────────────────────────────────────────────────────────

  it('deletes the DB row for each expired doc', async () => {
    setupSupabase([makeDoc('d1'), makeDoc('d2')]);
    await GET(makeRequest('test-secret'));
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'd1');
    expect(mockDeleteEq).toHaveBeenCalledWith('id', 'd2');
  });

  it('reports correct deleted_documents count', async () => {
    setupSupabase([makeDoc('d1'), makeDoc('d2'), makeDoc('d3')]);
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(body.deleted_documents).toBe(3);
  });

  // ── OTP cleanup RPC ───────────────────────────────────────────────────────────

  it('calls cleanup_expired_business_claim_otp RPC', async () => {
    setupSupabase([]);
    await GET(makeRequest('test-secret'));
    expect(mockRpc).toHaveBeenCalledWith('cleanup_expired_business_claim_otp');
  });

  it('continues and returns ok even when the OTP RPC returns an error', async () => {
    setupSupabase([]);
    mockRpc.mockResolvedValue({ error: { message: 'rpc failed' } });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  // ── Unexpected error ──────────────────────────────────────────────────────────

  it('returns 500 when an unexpected error is thrown', async () => {
    (getServiceSupabase as jest.Mock).mockImplementation(() => {
      throw new Error('catastrophic');
    });
    const res  = await GET(makeRequest('test-secret'));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe('Cleanup failed');
  });
});
