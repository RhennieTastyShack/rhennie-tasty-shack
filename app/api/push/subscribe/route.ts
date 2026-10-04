import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin } from "@/lib/supabase-admin";
import { getVapidPublicKey } from "@/lib/notify/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json(
      { success: false, message: "Push notifications are not configured yet." },
      { status: 503 }
    );
  }
  return NextResponse.json({ success: true, publicKey });
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in to enable notifications." },
        { status: 401 }
      );
    }

    if (!getVapidPublicKey()) {
      return NextResponse.json(
        { success: false, message: "Push notifications are not configured yet." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = String(body?.endpoint || "").trim();
    const p256dh = String(body?.keys?.p256dh || body?.p256dh || "").trim();
    const auth = String(body?.keys?.auth || body?.auth || "").trim();

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { success: false, message: "Invalid push subscription." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        auth_user_id: user.id,
        endpoint,
        p256dh,
        auth,
        user_agent: request.headers.get("user-agent")?.slice(0, 300) || null,
        revoked_at: null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "auth_user_id,endpoint" }
    );

    if (error) {
      console.error("push subscribe error:", error);
      return NextResponse.json(
        { success: false, message: "Unable to save notification preference." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("push subscribe unexpected:", error);
    return NextResponse.json(
      { success: false, message: "Unable to enable notifications." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const endpoint = String(body?.endpoint || "").trim();
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from("push_subscriptions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("auth_user_id", user.id)
      .is("revoked_at", null);

    if (endpoint) {
      query = query.eq("endpoint", endpoint);
    }

    await query;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("push unsubscribe unexpected:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update notifications." },
      { status: 500 }
    );
  }
}
