import { NextRequest, NextResponse } from "next/server";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("auth_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
    });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load notifications.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const notificationId = cleanText(body?.notification_id);
    const markAll = Boolean(body?.mark_all_read);

    const supabase = getSupabaseAdmin();

    if (markAll) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("auth_user_id", user.id)
        .eq("is_read", false);

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "notification_id is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("auth_user_id", user.id)
      .select("*")
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Notification not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update notification.",
      },
      { status: 500 }
    );
  }
}
