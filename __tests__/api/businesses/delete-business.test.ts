/**
 * Smoke tests: DELETE /api/businesses/[id]
 * - Unauthenticated request returns 401
 * - Authenticated non-owner returns 403
 * - Unknown business returns 404
 * - Authenticated owner successfully deletes business and returns 200
 */
import { DELETE } from '@/app/api/businesses/[id]/route';

jest.mock('@/app/lib/utils/optimizedQueries', () => ({
  invalidateBusinessCache: jest.fn(),
  fetchBusinessOptimized: jest.fn(),
}));

jest.mock('@/app/lib/utils/businessUpdateEvents', () => ({
  notifyBusinessUpdated: jest.fn(),
}));

jest.mock('@/app/lib/admin', () => ({
  isAdmin: jest.fn().mockResolvedValue(false),
  getServiceSupabase: jest.fn(),
}));

jest.mock('@/app/lib/cachePolicy', () => ({
  applyPrivateCachePolicy: jest.fn((res: any) => res),
}));

const mockGetServerSupabase = jest.fn();
jest.mock('@/app/lib/supabase/server', () => ({
  getServerSupabase: (...args: any[]) => mockGetServerSupabase(...args),
}));

const BUSINESS_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const USER_ID = 'user-uuid-aaa-111';

function buildSupabase(
  user: { id: string } | null,
  businessData: { id: string; owner_id: string; slug: string } | null,
  ownsViaOwnersTable = false
) {
  const selectBusinessChain = {
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: businessData, error: null }),
  };

  const selectOwnersChain = {
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: ownsViaOwnersTable ? { id: 'owner-row' } : null,
      error: null,
    }),
  };

  const selectImagesChain = {
    eq: jest.fn().mockResolvedValue({ data: [], error: null }),
  };

  const deleteChain = {
    eq: jest.fn().mockResolvedValue({ error: null }),
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: jest.fn((table: string) => {
      if (table === 'businesses') {
        return {
          select: jest.fn(() => selectBusinessChain),
          delete: jest.fn(() => deleteChain),
        };
      }
      if (table === 'business_owners') {
        return { select: jest.fn(() => selectOwnersChain) };
      }
      if (table === 'business_images') {
        return { select: jest.fn(() => selectImagesChain) };
      }
      return { select: jest.fn().mockResolvedValue({ data: null, error: null }) };
    }),
  };
}

describe('DELETE /api/businesses/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetServerSupabase.mockResolvedValue(buildSupabase(null, null));

    const req = new Request('http://localhost:3000/api/businesses/some-id', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'some-id' }) });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('returns 404 when the business does not exist', async () => {
    mockGetServerSupabase.mockResolvedValue(buildSupabase({ id: USER_ID }, null));

    const req = new Request(`http://localhost:3000/api/businesses/${BUSINESS_UUID}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: BUSINESS_UUID }) });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Business not found');
  });

  it('returns 403 when authenticated user does not own the business', async () => {
    const business = { id: BUSINESS_UUID, owner_id: 'someone-else', slug: 'test-biz' };
    mockGetServerSupabase.mockResolvedValue(buildSupabase({ id: USER_ID }, business, false));

    const req = new Request(`http://localhost:3000/api/businesses/${BUSINESS_UUID}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: BUSINESS_UUID }) });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toMatch(/permission/i);
  });

  it('returns 200 and success message when the owner deletes their business', async () => {
    const business = { id: BUSINESS_UUID, owner_id: USER_ID, slug: 'test-biz' };
    mockGetServerSupabase.mockResolvedValue(buildSupabase({ id: USER_ID }, business, false));

    const req = new Request(`http://localhost:3000/api/businesses/${BUSINESS_UUID}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: BUSINESS_UUID }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/deleted/i);
  });

  it('returns 200 when ownership is confirmed via the business_owners table', async () => {
    const business = { id: BUSINESS_UUID, owner_id: 'someone-else', slug: 'test-biz' };
    mockGetServerSupabase.mockResolvedValue(buildSupabase({ id: USER_ID }, business, true));

    const req = new Request(`http://localhost:3000/api/businesses/${BUSINESS_UUID}`, { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: BUSINESS_UUID }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
