import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/app/lib/supabase/server";

const MAX_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || "5");
const LOCKOUT_DURATION = parseInt(process.env.NEXT_PUBLIC_LOCKOUT_DURATION_MINUTES || "15");

export async function POST(request: NextRequest) {
  try {
    const { identifier, attemptType } = await request.json();

    if (!identifier || !attemptType) {
      return NextResponse.json(
        { error: "Identifier and attempt type are required" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    // Check current rate limit status
    const { data: existing } = await supabase
      .from("auth_rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .eq("attempt_type", attemptType)
      .single();

    const now = new Date();

    // Check if locked
    if (existing?.locked_until && new Date(existing.locked_until) > now) {
      const lockedUntilDate = new Date(existing.locked_until);
      const minutesRemaining = Math.ceil((lockedUntilDate.getTime() - now.getTime()) / 60000);

      return NextResponse.json(
        {
          locked: true,
          message: `Too many attempts. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}.`,
          lockedUntil: existing.locked_until,
          attemptsRemaining: 0,
        },
        { status: 429 }
      );
    }

    // Update or create rate limit record
    if (existing) {
      // Reset if lock has expired or clear old attempts
      const shouldReset = existing.locked_until && new Date(existing.locked_until) < now;
      const newAttempts = shouldReset ? 1 : existing.attempts + 1;
      const shouldLock = newAttempts >= MAX_ATTEMPTS;

      await supabase
        .from("auth_rate_limits")
        .update({
          attempts: newAttempts,
          last_attempt: now.toISOString(),
          locked_until: shouldLock
            ? new Date(now.getTime() + LOCKOUT_DURATION * 60000).toISOString()
            : null,
        })
        .eq("id", existing.id);

      if (shouldLock) {
        return NextResponse.json(
          {
            locked: true,
            message: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION} minutes.`,
            lockedUntil: new Date(now.getTime() + LOCKOUT_DURATION * 60000).toISOString(),
            attemptsRemaining: 0,
          },
          { status: 429 }
        );
      }

      return NextResponse.json({
        locked: false,
        attemptsRemaining: MAX_ATTEMPTS - newAttempts,
        message: `${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts !== 1 ? "s" : ""} remaining`,
      });
    } else {
      // Create new rate limit record
      await supabase.from("auth_rate_limits").insert({
        identifier,
        attempt_type: attemptType,
        attempts: 1,
        last_attempt: now.toISOString(),
      });

      return NextResponse.json({
        locked: false,
        attemptsRemaining: MAX_ATTEMPTS - 1,
        message: `${MAX_ATTEMPTS - 1} attempts remaining`,
      });
    }
  } catch (error) {
    console.error("Rate limit check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Clear rate limit (for successful login or manual reset)
export async function DELETE(request: NextRequest) {
  try {
    const { identifier, attemptType } = await request.json();

    if (!identifier || !attemptType) {
      return NextResponse.json(
        { error: "Identifier and attempt type are required" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    await supabase
      .from("auth_rate_limits")
      .delete()
      .eq("identifier", identifier)
      .eq("attempt_type", attemptType);

    return NextResponse.json({ success: true, message: "Rate limit cleared" });
  } catch (error) {
    console.error("Rate limit reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Check rate limit status without incrementing
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const identifier = url.searchParams.get("identifier");
    const attemptType = url.searchParams.get("attemptType");

    if (!identifier || !attemptType) {
      return NextResponse.json(
        { error: "Identifier and attempt type are required" },
        { status: 400 }
      );
    }

    const supabase = await getServerSupabase();

    const { data: existing } = await supabase
      .from("auth_rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .eq("attempt_type", attemptType)
      .single();

    const now = new Date();

    if (!existing) {
      return NextResponse.json({
        locked: false,
        attemptsRemaining: MAX_ATTEMPTS,
        message: "No attempts recorded",
      });
    }

    // Check if locked
    if (existing.locked_until && new Date(existing.locked_until) > now) {
      const lockedUntilDate = new Date(existing.locked_until);
      const minutesRemaining = Math.ceil((lockedUntilDate.getTime() - now.getTime()) / 60000);

      return NextResponse.json({
        locked: true,
        message: `Locked for ${minutesRemaining} more minute${minutesRemaining !== 1 ? "s" : ""}.`,
        lockedUntil: existing.locked_until,
        attemptsRemaining: 0,
      });
    }

    return NextResponse.json({
      locked: false,
      attemptsRemaining: MAX_ATTEMPTS - existing.attempts,
      attempts: existing.attempts,
      message: `${MAX_ATTEMPTS - existing.attempts} attempts remaining`,
    });
  } catch (error) {
    console.error("Rate limit status check error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
