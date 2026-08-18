import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

// GET MENU
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("menu")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Menu API Error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Menu API Error:", error);

    return NextResponse.json(
      { error: "Unable to load menu." },
      { status: 500 }
    );
  }
}