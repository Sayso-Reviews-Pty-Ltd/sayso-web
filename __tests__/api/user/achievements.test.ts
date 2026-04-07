/**
 * Smoke tests: GET /api/user/achievements
 * - Unauthenticated request returns 401
 * - Authenticated user with no reviews returns an empty data array
 * - Authenticated user with their first review earns "New Voice"
 * - Authenticated user with 10+ reviews earns all milestone achievements up to that count
 */
import { GET } from "@/app/api/user/achievements/route";

const mockGetServerSupabase = jest.fn();

jest.mock("@/app/lib/supabase/server", () => ({
  getServerSupabase: (...args: any[]) => mockGetServerSupabase(...args),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

const MOCK_USER = {
  id: "user-123",
  email: "test@example.com",
  created_at: "2024-01-01T00:00:00Z",
};

/**
 * Builds a mock Supabase client that covers every query made by the achievements route.
 *
 * The mock differentiates queries to the 'reviews' table by the columns passed to
 * .select() so that the count query, the id-list query, and the first-review query
 * each return the appropriate shape.
 */
function buildAchievementsSupabase({
  reviewsCount = 0,
  firstReview = null as { created_at: string } | null,
  isTopReviewer = false,
} = {}) {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: MOCK_USER }, error: null }),
    },
    from: jest.fn((table: string) => {
      // Each from() call gets its own resolved key so parallel chains don't collide.
      let resolvedKey = table;

      const chain: any = {
        select: jest.fn((cols: string, opts?: any) => {
          if (table === "reviews") {
            if (opts?.count === "exact") resolvedKey = "reviews-count";
            else if (cols === "id") resolvedKey = "reviews-ids";
            else resolvedKey = "reviews-first";
          }
          return chain;
        }),
        eq: jest.fn(() => chain),
        in: jest.fn(() => chain),
        order: jest.fn(() => chain),
        limit: jest.fn(() => chain),

        // Terminal: explicit .single() call
        single: jest.fn(() => {
          if (resolvedKey === "reviews-first")
            return Promise.resolve({ data: firstReview, error: null });
          if (resolvedKey === "profiles")
            return Promise.resolve({
              data: { is_top_reviewer: isTopReviewer, created_at: "2024-01-01T00:00:00Z" },
              error: null,
            });
          // user_stats and any other single() calls
          return Promise.resolve({ data: null, error: null });
        }),

        // Terminal: direct await (no .single()) — used for count queries
        then: (res: any, rej: any) => {
          let value: any;
          if (resolvedKey === "reviews-count") value = { count: reviewsCount, error: null };
          else if (resolvedKey === "reviews-ids") value = { data: [], error: null };
          else if (resolvedKey === "review_helpful_votes") value = { count: 0, error: null };
          else if (resolvedKey === "saved_businesses") value = { count: 0, error: null };
          else value = { data: null, error: null };
          return Promise.resolve(value).then(res, rej);
        },
      };

      return chain;
    }),
  };
}

describe("GET /api/user/achievements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetServerSupabase.mockResolvedValue({
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
      from: jest.fn(),
    });

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("returns an empty achievements array for a user with no reviews", async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildAchievementsSupabase({ reviewsCount: 0, firstReview: null })
    );

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toEqual([]);
  });

  it('awards "New Voice" to a user who has posted their first review', async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildAchievementsSupabase({
        reviewsCount: 1,
        firstReview: { created_at: "2025-03-01T00:00:00Z" },
      })
    );

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    const names = body.data.map((a: any) => a.name);
    expect(names).toContain("New Voice");
    expect(names).not.toContain("Rookie Reviewer");
  });

  it('awards "Rookie Reviewer" and "New Voice" to a user with 5 reviews', async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildAchievementsSupabase({
        reviewsCount: 5,
        firstReview: { created_at: "2025-01-01T00:00:00Z" },
      })
    );

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    const names = body.data.map((a: any) => a.name);
    expect(names).toContain("New Voice");
    expect(names).toContain("Rookie Reviewer");
    expect(names).not.toContain("Level Up!");
  });

  it('awards all milestones up to "Level Up!" for a user with 10 reviews', async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildAchievementsSupabase({
        reviewsCount: 10,
        firstReview: { created_at: "2025-01-01T00:00:00Z" },
      })
    );

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    const names = body.data.map((a: any) => a.name);
    expect(names).toContain("New Voice");
    expect(names).toContain("Rookie Reviewer");
    expect(names).toContain("Level Up!");
    expect(names).not.toContain("Review Machine");
  });

  it("each achievement has the required shape: name, description, icon, and earnedAt", async () => {
    mockGetServerSupabase.mockResolvedValue(
      buildAchievementsSupabase({
        reviewsCount: 1,
        firstReview: { created_at: "2025-03-01T00:00:00Z" },
      })
    );

    const req = new Request("http://localhost:3000/api/user/achievements");
    const res = await GET(req);
    const body = await res.json();

    for (const achievement of body.data) {
      expect(achievement).toHaveProperty("name");
      expect(achievement).toHaveProperty("description");
      expect(achievement).toHaveProperty("icon");
      expect(achievement).toHaveProperty("earnedAt");
    }
  });
});
