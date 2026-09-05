import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing");
}

if (!paystackSecretKey) {
  throw new Error("PAYSTACK_SECRET_KEY is missing");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
);

type CheckoutItem = {
  id: string;
  name: string;
  collection?: string;
  quantity: number;
  price: number;
  selectedSize?: string | null;
};

type CheckoutBody = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup";
  deliveryAddress?: string;
  notes?: string;
  items: CheckoutItem[];
};

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `RTS-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  let createdOrderId: string | null = null;

  try {
    const body =
      (await request.json()) as CheckoutBody;

    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryType,
      deliveryAddress,
      notes,
      items,
    } = body;

    /* =====================================================
       VALIDATION
    ====================================================== */

    if (!customerName?.trim()) {
      return NextResponse.json(
        { error: "Customer name is required." },
        { status: 400 }
      );
    }

    if (!customerEmail?.trim()) {
      return NextResponse.json(
        { error: "Customer email is required." },
        { status: 400 }
      );
    }

    if (!customerPhone?.trim()) {
      return NextResponse.json(
        { error: "Customer phone is required." },
        { status: 400 }
      );
    }

    if (
      deliveryType !== "delivery" &&
      deliveryType !== "pickup"
    ) {
      return NextResponse.json(
        { error: "Invalid delivery type." },
        { status: 400 }
      );
    }

    if (
      deliveryType === "delivery" &&
      !deliveryAddress?.trim()
    ) {
      return NextResponse.json(
        { error: "Delivery address is required." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    /* =====================================================
       CALCULATE TOTAL
    ====================================================== */

    let subtotal = 0;

    for (const item of items) {
      if (!item.name?.trim()) {
        return NextResponse.json(
          { error: "An order item is missing its name." },
          { status: 400 }
        );
      }

      if (
        !Number.isFinite(item.price) ||
        item.price < 0
      ) {
        return NextResponse.json(
          {
            error: `Invalid price for ${item.name}.`,
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
      ) {
        return NextResponse.json(
          {
            error: `Invalid quantity for ${item.name}.`,
          },
          { status: 400 }
        );
      }

      subtotal +=
        Number(item.price) *
        Number(item.quantity);
    }

    /*
     * Delivery pricing will be connected to
     * your business delivery rules later.
     *
     * Current checkout:
     * Delivery = ₦0
     */
    const deliveryFee = 0;

    const total = subtotal + deliveryFee;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Order total must be greater than zero." },
        { status: 400 }
      );
    }

    /* =====================================================
       CREATE ORDER NUMBER
    ====================================================== */

    const orderNumber =
      generateOrderNumber();

    /* =====================================================
       CREATE ORDER
    ====================================================== */

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .insert({
          order_no: orderNumber,

          order_number: orderNumber,

          customer_name:
            customerName.trim(),

          customer_email:
            customerEmail.trim(),

          customer_phone:
            customerPhone.trim(),

          title: "Online Food Order",

          order_date:
            new Date()
              .toISOString()
              .split("T")[0],

          amount: total,

          subtotal,

          delivery_fee:
            deliveryFee,

          total,

          status: "In Review",

          order_status: "pending",

          payment_status: "pending",

          payment_channel: "paystack",

          delivery_type:
            deliveryType,

          delivery_address:
            deliveryType === "delivery"
              ? deliveryAddress?.trim() || null
              : null,

          notes:
            notes?.trim() || null,
        })
        .select("id")
        .single();

    if (orderError || !order) {
      console.error(
        "Create order error:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            orderError?.message ||
            "Unable to create order.",
        },
        { status: 500 }
      );
    }

    createdOrderId = order.id;

    /* =====================================================
       CREATE ORDER ITEMS
    ====================================================== */

    const orderItems = items.map(
      (item) => ({
        order_id: order.id,

        /*
         * menu_item_id is nullable in your
         * current database structure.
         */
        menu_item_id:
          item.id || null,

        name:
          item.name.trim(),

        collection:
          item.collection ||
          null,

        quantity:
          item.quantity,

        unit_price:
          item.price,

        selected_size:
          item.selectedSize ||
          null,

        item_total:
          item.price *
          item.quantity,
      })
    );

    const {
      error: orderItemsError,
    } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (orderItemsError) {
      console.error(
        "Create order items error:",
        orderItemsError
      );

      /*
       * Remove the order if its items
       * could not be created.
       */
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            "Unable to create order items.",
        },
        { status: 500 }
      );
    }

    /* =====================================================
       PAYSTACK INITIALIZATION
    ====================================================== */

    const reference =
      `${orderNumber}-${Date.now()}`;

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const callbackUrl =
      `${appUrl}/checkout/success?order=${encodeURIComponent(
        order.id
      )}&reference=${encodeURIComponent(
        reference
      )}`;

    const paystackResponse =
      await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${paystackSecretKey}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              customerEmail.trim(),

            amount:
              String(
                Math.round(
                  total * 100
                )
              ),

            currency: "NGN",

            reference,

            callback_url:
              callbackUrl,

            metadata: {
              order_id:
                order.id,

              order_number:
                orderNumber,

              customer_name:
                customerName.trim(),

              customer_phone:
                customerPhone.trim(),

              delivery_type:
                deliveryType,
            },
          }),
        }
      );

    const paystackData =
      await paystackResponse.json();

    if (
      !paystackResponse.ok ||
      !paystackData?.status ||
      !paystackData?.data
        ?.authorization_url
    ) {
      console.error(
        "Paystack initialization error:",
        paystackData
      );

      /*
       * Payment wasn't initialized,
       * so remove the pending order.
       */
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            paystackData?.message ||
            "Unable to initialize Paystack payment.",
        },
        { status: 502 }
      );
    }

    /* =====================================================
       SAVE PAYMENT REFERENCE
    ====================================================== */

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        payment_reference:
          paystackData.data.reference,

        payment_status:
          "pending",

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error(
        "Payment reference update error:",
        updateError
      );
    }

    /* =====================================================
       RETURN PAYSTACK URL
    ====================================================== */

    return NextResponse.json(
      {
        success: true,

        orderId:
          order.id,

        orderNumber,

        reference:
          paystackData.data.reference,

        authorizationUrl:
          paystackData.data.authorization_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Initialize payment error:",
      error
    );

    /*
     * If an unexpected error happened after
     * creating an order, clean it up.
     */
    if (createdOrderId) {
      await supabaseAdmin
        .from("orders")
        .delete()
        .eq("id", createdOrderId);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to initialize payment.",
      },
      { status: 500 }
    );
  }
}