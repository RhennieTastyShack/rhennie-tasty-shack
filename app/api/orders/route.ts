import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing"
  );
}

if (!publishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing"
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing"
  );
}

const supabaseAuth = createClient(
  supabaseUrl,
  publishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export async function GET(
  request: NextRequest
) {
  try {
    /*
     * 1. Read the logged-in customer's access token.
     */
    const authorization =
      request.headers.get("authorization");

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authorization.substring(7).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * 2. Ask Supabase to verify the token.
     *
     * Never trust a customer_id supplied by the browser.
     * The customer ID comes from the verified Supabase user.
     */
    const {
      data: userData,
      error: userError,
    } = await supabaseAuth.auth.getUser(
      accessToken
    );

    if (
      userError ||
      !userData?.user
    ) {
      console.error(
        "Orders authentication error:",
        userError
      );

      return NextResponse.json(
        {
          error:
            "Your session is invalid or has expired.",
        },
        {
          status: 401,
        }
      );
    }

    const user = userData.user;

    /*
     * 3. Fetch ONLY this customer's orders.
     *
     * orders.customer_id is TEXT in the current database,
     * while Supabase user.id is UUID represented as a string.
     * Comparing against user.id is therefore correct here.
     */
    const {
      data,
      error,
    } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          id,
          order_id,
          menu_item_id,
          name,
          collection,
          quantity,
          unit_price,
          selected_size,
          item_total,
          created_at
        ),
        consultation:consultations (
          id,
          customer_id,
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
      .eq("customer_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Orders API database error:",
        error
      );

      return NextResponse.json(
        {
          error: "Unable to load orders.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      data ?? [],
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Orders API unexpected error:",
      error
    );

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