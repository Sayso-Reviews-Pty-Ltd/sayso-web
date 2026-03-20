/**
 * Smoke tests: POST /api/badges/check-and-award
 * - Unauthenticated request returns 401
 * - Authenticated user with no new badges returns ok with empty newBadges array
 * - Authenticated user who earns a badge returns ok with badge details
 */
import { POST } from '@/app/api/badges/check-and-award/route';

const mockGetServerSupabase = jest.fn();

jest.mock('@/app/lib/supabase/server', () => ({
  getServerSupabase: (...args: any[]) => mockGetServerSupabase(...args),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/app/lib/admin', () => ({
  getServiceSupabase: jest.fn(() => ({
    rpc: jest.fn().mockResolvedValue({ error: null }),
  })),
  isAdmin: jest.fn().mockResolvedValue(false),
}));

const MOCK_USER = { id: 'user-456', email: 'tester@example.com' };

const MOCK_BADGE = {
  id: 'badge-uuid-001',
  name: 'First Timer',
  description: 'Awarded for your first action',
  icon_path: '/badges/001-star.png',
  badge_group: 'milestones',
};

function buildBadgesSupabase({
  awardedBadges = [] as Array<{ awarded_badge_id: string; badge_name: string }>,
  badgeDetails = [] as typeof MOCK_BADGE[],
} = {}) {
  const badgesFromChain = {
    select: jest.fn().mockReturnThis(),
    in: jest.fn().mockResolvedValue({ data: badgeDetails, error: null }),
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }),
    },
    rpc: jest.fn((name: string) => {
      if (name === 'check_user_badges') {
        return Promise.resolve({ data: awardedBadges, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    }),
    from: jest.fn((table: string) => {
      if (table === 'badges') return badgesFromChain;
      return { select: jest.fn().mockReturnThis(), in: jest.fn().mockResolvedValue({ data: [], error: null }) };
    }),
  };
}

describe('POST /api/badges/check-and-award', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    mockGetServerSupabase.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
      from: jest.fn(),
      rpc: jest.fn(),
    });

    const req = new Request('http://localhost:3000/api/badges/check-and-award', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty('error', 'Unauthorized');
  });

  it('returns ok with an empty newBadges array when no badges are earned', async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildBadgesSupabase({ awardedBadges: [], badgeDetails: [] })
    );

    const req = new Request('http://localhost:3000/api/badges/check-and-award', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.newBadges).toEqual([]);
    expect(body.message).toMatch(/no new badges/i);
  });

  it('returns ok with badge details when the user earns a new badge', async () => {
    const awarded = [{ awarded_badge_id: MOCK_BADGE.id, badge_name: MOCK_BADGE.name }];
    mockGetServerSupabase.mockResolvedValue(
      buildBadgesSupabase({ awardedBadges: awarded, badgeDetails: [MOCK_BADGE] })
    );

    const req = new Request('http://localhost:3000/api/badges/check-and-award', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.newBadges).toHaveLength(1);
    expect(body.newBadges[0]).toMatchObject({
      id: MOCK_BADGE.id,
      name: MOCK_BADGE.name,
      description: MOCK_BADGE.description,
      icon_path: MOCK_BADGE.icon_path,
    });
    expect(body.message).toMatch(/congratulations/i);
  });

  it('returns ok with multiple badges when several are earned at once', async () => {
    const secondBadge = { ...MOCK_BADGE, id: 'badge-uuid-002', name: 'Power User' };
    const awarded = [
      { awarded_badge_id: MOCK_BADGE.id, badge_name: MOCK_BADGE.name },
      { awarded_badge_id: secondBadge.id, badge_name: secondBadge.name },
    ];
    mockGetServerSupabase.mockResolvedValue(
      buildBadgesSupabase({ awardedBadges: awarded, badgeDetails: [MOCK_BADGE, secondBadge] })
    );

    const req = new Request('http://localhost:3000/api/badges/check-and-award', { method: 'POST' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.newBadges).toHaveLength(2);
    expect(body.message).toMatch(/2 new badge/i);
  });
});
