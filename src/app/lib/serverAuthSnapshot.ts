import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { AuthUser, Profile } from "./types/database";
import { buildAuthenticatedSnapshot, buildGuestSnapshot, type AuthSnapshot } from "./authSnapshot";

const EMPTY_PROFILE: Profile = {
  id: "",
  onboarding_step: "interests",
  onboarding_complete: false,
  interests_count: 0,
  subcategories_count: 0,
  dealbreakers_count: 0,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
  role: "user",
  account_role: "user",
};

function profileFromRow(
  userId: string,
  row: {
    role?: string | null;
    account_role?: string | null;
    onboarding_completed_at?: string | null;
    onboarding_step?: string | null;
    interests_count?: number | null;
    subcategories_count?: number | null;
    dealbreakers_count?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
  } | null,
): Profile {
  if (!row) {
    return {
      ...EMPTY_PROFILE,
      id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const onboardingCompletedAt = row.onboarding_completed_at ?? undefined;
  return {
    ...EMPTY_PROFILE,
    id: userId,
    role: (row.role as Profile["role"]) ?? "user",
    account_role: (row.account_role as Profile["account_role"]) ?? "user",
    onboarding_step: row.onboarding_step ?? "interests",
    onboarding_complete: Boolean(onboardingCompletedAt),
    onboarding_completed_at: onboardingCompletedAt,
    interests_count: row.interests_count ?? 0,
    subcategories_count: row.subcategories_count ?? 0,
    dealbreakers_count: row.dealbreakers_count ?? 0,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? new Date().toISOString(),
  };
}

function toAuthUser(
  user: {
    id: string;
    email?: string | null;
    email_confirmed_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
  },
  profile: Profile,
): AuthUser {
  const nowIso = new Date().toISOString();
  return {
    id: user.id,
    email: user.email ?? "",
    email_verified: Boolean(user.email_confirmed_at),
    created_at: user.created_at ?? nowIso,
    updated_at: user.updated_at ?? user.created_at ?? nowIso,
    profile,
  };
}

export async function getServerAuthSnapshot(): Promise<AuthSnapshot> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          // Server Components are read-only for cookies.
          setAll() {},
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return buildGuestSnapshot("server");
    }

    const { data: profileRow } = await supabase
      .from("profiles")
      .select(
        "role, account_role, onboarding_completed_at, onboarding_step, interests_count, subcategories_count, dealbreakers_count, created_at, updated_at",
      )
      .eq("user_id", user.id)
      .maybeSingle();

    const profile = profileFromRow(user.id, profileRow);
    return buildAuthenticatedSnapshot(toAuthUser(user, profile), "server");
  } catch {
    return buildGuestSnapshot("server");
  }
}
