import { NextRequest, NextResponse } from "next/server";
import { notifyCustomer } from "@/lib/notify";
import { getAuthUser } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Confirms password change after Supabase Auth updateUser succeeds. */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user?.email) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    await notifyCustomer({
      event: "PASSWORD_CHANGED",
      authUserId: user.id,
      email: user.email,
      dedupeKey: `PASSWORD_CHANGED:${user.id}:${Math.floor(Date.now() / 60_000)}`,
      skipChannels: ["sms", "whatsapp"],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password changed notify error:", error);
    return NextResponse.json({ success: true });
  }
}
