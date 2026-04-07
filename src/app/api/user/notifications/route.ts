import { NextRequest, NextResponse } from "next/server";
import { withUser } from "@/app/api/_lib/withAuth";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/user/notifications
 * Persist notification preferences to profiles.notification_preferences JSONB column
 */
export const PATCH = withUser(async (req: NextRequest, { user, supabase }) => {
  try {
    const body = await req.json();
    const { reviews, messages, bookings } = body;

    const notification_preferences = {
      reviews: reviews !== false,
      messages: messages !== false,
      bookings: bookings !== false,
    };

    const { error } = await supabase
      .from("profiles")
      .update({ notification_preferences, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (error) {
      console.error("[Notifications API] PATCH error:", error);
      return NextResponse.json(
        {
          data: null,
          error: { message: "Failed to update notification preferences", code: "UPDATE_FAILED" },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { notification_preferences }, error: null });
  } catch (error: any) {
    console.error("[Notifications API] PATCH unexpected error:", error);
    return NextResponse.json(
      {
        data: null,
        error: { message: error.message || "Internal server error", code: "INTERNAL_ERROR" },
      },
      { status: 500 }
    );
  }
});
