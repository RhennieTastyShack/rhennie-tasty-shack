import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns verification gate status for the logged-in customer.
 */
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

    const { data: authData } = await supabase.auth.admin.getUserById(user.id);
    const emailConfirmed = Boolean(authData?.user?.email_confirmed_at);

    const { data: profile } = await supabase
      .from("client_profiles")
      .select("phone, phone_verified_at, full_name, email")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const phoneVerified = Boolean(profile?.phone_verified_at);

    return NextResponse.json({
      success: true,
      email_confirmed: emailConfirmed,
      phone_verified: phoneVerified,
      fully_verified: emailConfirmed && phoneVerified,
      phone: profile?.phone || null,
      email: user.email || profile?.email || null,
      full_name: profile?.full_name || null,
    });
  } catch (error) {
    console.error("Verification status error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to check verification status.",
      },
      { status: 500 }
    );
  }
}
