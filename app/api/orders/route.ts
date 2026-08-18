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

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        consultation:consultations (
          id,
          full_name,
          email,
          phone,
          event_type,
          event_date,
          event_time,
          guest_count,
          venue,
          budget,
          special_request
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders API Error:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(data ?? [], {
      status: 200,
    });
  } catch (error) {
    console.error("Orders API Error:", error);

    return NextResponse.json(
      {
        error: "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}