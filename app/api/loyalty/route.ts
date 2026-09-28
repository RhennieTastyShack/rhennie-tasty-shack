import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase-admin";
import { getLoyaltyBoard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user?.email) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const board = await getLoyaltyBoard(user.email);
    return NextResponse.json({ success: true, ...board });
  } catch (error) {
    console.error("Loyalty error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to load rewards.",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, message: "Rewards are added automatically when an order is paid." },
    { status: 405 }
  );
}
