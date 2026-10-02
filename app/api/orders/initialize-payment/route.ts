import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createClient } from "@supabase/supabase-js";
import {
  buildStatusHistoryEntry,
  createOrderCode,
  createTrackingToken,
  DeliveryMode,
  DeliveryStatus,
} from "@/lib/delivery";
import { getCheckoutDeliveryQuote } from "@/lib/delivery-fee";
import {
  getRidePlatformCommissionPercent,
  getRideStartingFeeNgn,
  getRideSurgeConfig,
  getVehiclePricingCatalog,
  isSurgeActiveNow,
} from "@/lib/platform-settings";
import { splitDeliveryEarning } from "@/lib/ride-with-701";
import {
  availabilityNote,
  isMenuItemAvailableToday,
  minOrderQuantity,
} from "@/lib/menu-order-rules";
import {
  isPaymentCurrency,
  NGN_PER_USD,
  ngnToUsd,
  PaymentCurrency,
} from "@/lib/payment-currency";
import { promoDiscount, quotePromo } from "@/lib/promos";
import { debitWallet } from "@/lib/customer-wallet";
import { getPaystackSecretKey } from "@/lib/env";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Lazy admin client — avoids import-time crashes when secrets are absent in Preview. */
function supabaseAdmin() {
  return getSupabaseAdmin();
}

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
  dispatchMode?: "CUSTOMER_DISPATCH" | "PLATFORM";
  externalRiderName?: string;
  externalRiderPhone?: string;
  externalRiderCompany?: string;
  externalRiderPlate?: string;
  paymentCurrency?: PaymentCurrency;
  promoCode?: string;
  tipAmount?: number;
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
      dispatchMode,
      externalRiderName,
      externalRiderPhone,
      externalRiderCompany,
      externalRiderPlate,
      paymentCurrency: rawPaymentCurrency,
    } = body;

    const paymentCurrency: PaymentCurrency = isPaymentCurrency(
      String(rawPaymentCurrency || "NGN")
    )
      ? (rawPaymentCurrency as PaymentCurrency)
      : "NGN";

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

    const resolvedDispatchMode =
      (dispatchMode || "PLATFORM") as DeliveryMode;

    if (
      deliveryType === "delivery" &&
      resolvedDispatchMode !== "CUSTOMER_DISPATCH" &&
      resolvedDispatchMode !== "PLATFORM"
    ) {
      return NextResponse.json(
        { error: "Invalid dispatch mode." },
        { status: 400 }
      );
    }

    if (
      deliveryType === "delivery" &&
      resolvedDispatchMode === "CUSTOMER_DISPATCH"
    ) {
      const riderName = externalRiderName?.trim() || "";
      const riderPhone = externalRiderPhone?.trim() || "";

      if (!riderName || riderPhone.replace(/\D/g, "").length < 10) {
        return NextResponse.json(
          {
            error:
              "Dispatch rider name and a valid phone number are required.",
          },
          { status: 400 }
        );
      }
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

    const itemIds = [
      ...new Set(
        items
          .map((item) => String(item.id || "").trim())
          .filter(Boolean)
      ),
    ];

    if (itemIds.length === 0) {
      return NextResponse.json(
        { error: "Choose each dish from the menu." },
        { status: 400 }
      );
    }

    const pricedById = new Map<
      string,
      { name: string; price: number }
    >();

    const { data: menuItemRows, error: menuItemError } =
      await supabaseAdmin()
        .from("menu_items")
        .select("id, name, price")
        .in("id", itemIds);

    if (menuItemError) {
      return NextResponse.json(
        { error: "Unable to price the menu." },
        { status: 500 }
      );
    }

    for (const row of menuItemRows || []) {
      const price = Number(row.price);
      const name = String(row.name || "").trim();

      if (row.id && name && Number.isFinite(price) && price > 0) {
        pricedById.set(row.id, { name, price });
      }
    }

    const missingIds = itemIds.filter((id) => !pricedById.has(id));

    if (missingIds.length > 0) {
      const { data: menuRows, error: menuError } =
        await supabaseAdmin()
          .from("menu")
          .select("id, name, price")
          .in("id", missingIds);

      if (menuError) {
        return NextResponse.json(
          { error: "Unable to price the menu." },
          { status: 500 }
        );
      }

      for (const row of menuRows || []) {
        const price = Number(row.price);
        const name = String(row.name || "").trim();

        if (row.id && name && Number.isFinite(price) && price > 0) {
          pricedById.set(row.id, { name, price });
        }
      }
    }

    const sizedNames = [
      ...new Set(
        items
          .filter((item) => String(item.selectedSize || "").trim())
          .map((item) => pricedById.get(String(item.id || "").trim())?.name)
          .filter((name): name is string => Boolean(name))
      ),
    ];

    const pricesByName = new Map<string, number[]>();

    async function collectNamedPrices(table: "menu_items" | "menu") {
      if (sizedNames.length === 0) return;

      const { data, error } = await supabaseAdmin()
        .from(table)
        .select("name, price")
        .in("name", sizedNames);

      if (error) {
        throw new Error(error.message);
      }

      for (const row of data || []) {
        const name = String(row.name || "").trim().toLowerCase();
        const price = Math.round(Number(row.price));

        if (!name || !Number.isFinite(price) || price <= 0) continue;

        const current = pricesByName.get(name) || [];
        if (!current.includes(price)) current.push(price);
        pricesByName.set(name, current);
      }
    }

    try {
      await collectNamedPrices("menu_items");
      await collectNamedPrices("menu");
    } catch {
      return NextResponse.json(
        { error: "Unable to price the menu." },
        { status: 500 }
      );
    }

    let subtotal = 0;

    for (const item of items) {
      const priced = pricedById.get(String(item.id || "").trim());

      if (!priced) {
        return NextResponse.json(
          {
            error: `${item.name?.trim() || "A dish"} is not on the menu.`,
          },
          { status: 400 }
        );
      }

      item.name = priced.name;

      if (String(item.selectedSize || "").trim()) {
        const allowed =
          pricesByName.get(priced.name.toLowerCase()) || [
            Math.round(priced.price),
          ];
        const requested = Math.round(Number(item.price));

        if (!allowed.includes(requested)) {
          return NextResponse.json(
            {
              error: `${priced.name} ${item.selectedSize} is not on the menu.`,
            },
            { status: 400 }
          );
        }

        item.price = requested;
      } else {
        item.price = priced.price;
      }

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

      if (!isMenuItemAvailableToday(item.name)) {
        return NextResponse.json(
          {
            error:
              availabilityNote(item.name) ||
              `${item.name} is not available today.`,
          },
          { status: 400 }
        );
      }

      const floor = minOrderQuantity(item.name);
      if (item.quantity < floor) {
        return NextResponse.json(
          {
            error: `${item.name} has a minimum order of ${floor}.`,
          },
          { status: 400 }
        );
      }

      subtotal +=
        Number(item.price) *
        Number(item.quantity);
    }

    const [vehicleCatalog, commissionPercent, surgeConfig, startingFeeNgn] =
      await Promise.all([
        getVehiclePricingCatalog(),
        getRidePlatformCommissionPercent(),
        getRideSurgeConfig(),
        getRideStartingFeeNgn(),
      ]);
    const itemCount = items.reduce(
      (sum, item) => sum + Math.max(0, Number(item.quantity) || 0),
      0
    );
    const preliminaryQuote = getCheckoutDeliveryQuote(
      deliveryType,
      deliveryAddress || "",
      {
        dispatchMode: resolvedDispatchMode,
        itemCount,
        catalog: vehicleCatalog,
        startingFromNgn: startingFeeNgn,
      }
    );
    const surgeActive = isSurgeActiveNow(surgeConfig, {
      vehicleCategory: preliminaryQuote.recommendedVehicle?.category,
      address: deliveryAddress || "",
    });
    const deliveryQuote = getCheckoutDeliveryQuote(
      deliveryType,
      deliveryAddress || "",
      {
        dispatchMode: resolvedDispatchMode,
        itemCount,
        catalog: vehicleCatalog,
        applySurge: surgeActive,
        surgeMultiplier: surgeConfig.multiplier,
        surgeReason: surgeConfig.reason,
        startingFromNgn: startingFeeNgn,
      }
    );
    const deliveryFee = deliveryQuote.feeNgn;
    const deliverySplit =
      resolvedDispatchMode === "PLATFORM"
        ? splitDeliveryEarning(deliveryFee, commissionPercent)
        : {
            percent: 0,
            platformShare: 0,
            partnerShare: 0,
          };
    const recommendedVehicle =
      deliveryQuote.recommendedVehicle?.category || null;
    const pickupCode =
      deliveryType === "pickup" ||
      resolvedDispatchMode === "CUSTOMER_DISPATCH"
        ? createOrderCode()
        : null;

    const tipAmount = Math.min(
      20000,
      Math.max(0, Math.round(Number(body?.tipAmount) || 0))
    );

    const promo = quotePromo(String(body?.promoCode || ""));

    if (promo.error) {
      return NextResponse.json(
        { error: promo.error },
        { status: 400 }
      );
    }

    const discount = promoDiscount(subtotal, promo.percent);
    const total = subtotal - discount + deliveryFee + tipAmount;
    const orderNotes = [
      notes?.trim() || "",
      discount > 0
        ? `Promo ${promo.code} saved ₦${discount.toLocaleString("en-NG")} on the food.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");

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
       OPTIONAL AUTH CUSTOMER
    ====================================================== */

    let customerId: string | null = null;

    const authorization =
      request.headers.get("authorization");

    if (authorization && publishableKey) {
      const [type, token] =
        authorization.split(" ");

      if (
        type?.toLowerCase() === "bearer" &&
        token
      ) {
        const supabaseAuth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          publishableKey,
          {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          }
        );

        const {
          data: { user },
        } = await supabaseAuth.auth.getUser(
          token.trim()
        );

        customerId = user?.id || null;
      }
    }

    /* =====================================================
       CREATE ORDER
    ====================================================== */

    const orderPayload: Record<string, unknown> = {
          order_no: orderNumber,

          order_number: orderNumber,

          customer_id: customerId,

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

          tip_amount: tipAmount,

          fulfilment_method:
            deliveryType === "pickup"
              ? "pickup"
              : resolvedDispatchMode === "CUSTOMER_DISPATCH"
                ? "own_rider"
                : "ride_with_701",

          recommended_vehicle: recommendedVehicle,

          pickup_code: pickupCode,

          pickup_status:
            deliveryType === "pickup" ? "Preparing" : null,

          total,

          status: "In Review",

          order_status: "pending",

          payment_status: "pending",

          payment_channel:
            paymentCurrency === "CRYPTO"
              ? "crypto"
              : paymentCurrency === "USD"
                ? "paystack-usd"
                : paymentCurrency === "WALLET"
                  ? "rts-wallet"
                  : "paystack",

          delivery_type:
            deliveryType,

          delivery_address:
            deliveryType === "delivery"
              ? deliveryAddress?.trim() || null
              : null,

          notes:
            orderNotes || null,
        };

    let { data: order, error: orderError } =
      await supabaseAdmin()
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();

    if (
      orderError &&
      /Could not find the '([^']+)' column of 'orders'/i.test(
        String(orderError.message || "")
      )
    ) {
      const missing = String(orderError.message || "").match(
        /Could not find the '([^']+)' column of 'orders'/i
      );
      if (missing?.[1] && missing[1] in orderPayload) {
        delete orderPayload[missing[1]];
        const retry = await supabaseAdmin()
          .from("orders")
          .insert(orderPayload)
          .select("id")
          .single();
        order = retry.data;
        orderError = retry.error;
      }
    }

    if (
      orderError &&
      /tip_amount|fulfilment_method|recommended_vehicle|pickup_code|pickup_status/i.test(
        String(orderError.message || "")
      )
    ) {
      delete orderPayload.tip_amount;
      delete orderPayload.fulfilment_method;
      delete orderPayload.recommended_vehicle;
      delete orderPayload.pickup_code;
      delete orderPayload.pickup_status;
      const retry = await supabaseAdmin()
        .from("orders")
        .insert(orderPayload)
        .select("id")
        .single();
      order = retry.data;
      orderError = retry.error;
    }

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
    } = await supabaseAdmin()
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
      await supabaseAdmin()
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
       CREATE DELIVERY RECORD
    ====================================================== */

    let trackingToken: string | null = null;
    let orderCode: string | null = pickupCode;

    if (deliveryType === "delivery") {
      const initialStatus: DeliveryStatus =
        resolvedDispatchMode === "CUSTOMER_DISPATCH"
          ? "ASSIGNED"
          : "UNASSIGNED";

      trackingToken = createTrackingToken();
      orderCode =
        resolvedDispatchMode === "CUSTOMER_DISPATCH"
          ? pickupCode
          : createOrderCode();

      const deliveryRow: Record<string, unknown> = {
        order_id: order.id,
        mode: resolvedDispatchMode,
        rider_id: null,
        external_rider_name:
          resolvedDispatchMode === "CUSTOMER_DISPATCH"
            ? externalRiderName?.trim() || null
            : null,
        external_rider_phone:
          resolvedDispatchMode === "CUSTOMER_DISPATCH"
            ? externalRiderPhone?.trim() || null
            : null,
        external_rider_company:
          resolvedDispatchMode === "CUSTOMER_DISPATCH"
            ? externalRiderCompany?.trim() || null
            : null,
        external_rider_plate:
          resolvedDispatchMode === "CUSTOMER_DISPATCH"
            ? externalRiderPlate?.trim() || null
            : null,
        recommended_vehicle: recommendedVehicle,
        customer_delivery_charge: deliveryFee,
        gross_delivery_earning: deliveryFee,
        platform_commission_percent: deliverySplit.percent,
        platform_commission_amount: deliverySplit.platformShare,
        partner_net_earning: deliverySplit.partnerShare,
        status: initialStatus,
        tracking_token: trackingToken,
        order_code: orderCode,
        tip_amount: tipAmount,
        status_history: [
          buildStatusHistoryEntry(
            initialStatus,
            "checkout",
            resolvedDispatchMode === "CUSTOMER_DISPATCH"
              ? "Customer provided their own dispatch rider."
              : "Platform rider requested at checkout."
          ),
        ],
        updated_at: new Date().toISOString(),
      };

      let deliveryError: { message?: string } | null = null;

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const { error } = await supabaseAdmin()
          .from("deliveries")
          .insert(deliveryRow);

        if (!error) {
          deliveryError = null;
          break;
        }

        const missingColumn = String(error.message || "").match(
          /Could not find the '([^']+)' column of 'deliveries'/
        );

        if (missingColumn && missingColumn[1] in deliveryRow) {
          delete deliveryRow[missingColumn[1]];
          deliveryError = error;
          continue;
        }

        deliveryError = error;
        break;
      }

      if (deliveryError) {
        console.error(
          "Create delivery error:",
          deliveryError
        );

        await supabaseAdmin()
          .from("orders")
          .delete()
          .eq("id", order.id);

        return NextResponse.json(
          {
            error:
              deliveryError.message ||
              "Unable to create delivery record.",
          },
          { status: 500 }
        );
      }
    }

    if (paymentCurrency === "WALLET") {
      if (!customerId) {
        await supabaseAdmin().from("orders").delete().eq("id", order.id);

        return NextResponse.json(
          { error: "Sign in to pay with your RTS wallet." },
          { status: 401 }
        );
      }

      const debit = await debitWallet(customerId, total, order.id);

      if (!debit.ok) {
        await supabaseAdmin().from("orders").delete().eq("id", order.id);

        return NextResponse.json(
          { error: debit.message },
          { status: 400 }
        );
      }

      await supabaseAdmin()
        .from("orders")
        .update({
          payment_status: "paid",
          payment_channel: "rts-wallet",
          payment_reference: `RTS-WALLET-ORDER-${order.id}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      try {
        const { notifyOrderPaid } = await import("@/lib/notify/hooks");
        void notifyOrderPaid(order.id);
      } catch (notifyError) {
        console.error("Wallet paid notice error:", notifyError);
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        walletPaid: true,
        trackingToken,
        orderCode,
      });
    }

    /* =====================================================
       PAYSTACK INITIALIZATION
    ====================================================== */

    const reference =
      `${orderNumber}-${Date.now()}-${randomBytes(8).toString("hex")}`;

    const appUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      new URL(request.url).origin;

    const usdAmount = ngnToUsd(total);
    const chargeCurrency = paymentCurrency === "USD" ? "USD" : "NGN";
    const chargeAmount =
      chargeCurrency === "USD"
        ? Math.round(usdAmount * 100)
        : Math.round(total * 100);

    async function insertPaymentRow(
      row: Record<string, unknown>
    ) {
      const payload = { ...row };

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const { error } = await supabaseAdmin()
          .from("payments")
          .insert(payload);

        if (!error) {
          return null;
        }

        const missingColumn = String(error.message || "").match(
          /Could not find the '([^']+)' column of 'payments'/
        );

        if (missingColumn && missingColumn[1] in payload) {
          delete payload[missingColumn[1]];
          continue;
        }

        return error;
      }

      return {
        message: "Unable to create payment record.",
      };
    }

    if (paymentCurrency === "CRYPTO") {
      const paymentInsertError = await insertPaymentRow({
        order_id: order.id,
        subscription_id: null,
        amount: usdAmount,
        currency: "USDT",
        payment_method: "crypto",
        payment_provider: "crypto",
        payment_status: "pending",
        payment_reference: reference,
        base_currency: "NGN",
        base_amount: total,
        exchange_rate: NGN_PER_USD,
        paid_at: null,
        updated_at: new Date().toISOString(),
      });

      if (paymentInsertError) {
        console.error(
          "Payment record insert error:",
          paymentInsertError
        );

        await supabaseAdmin()
          .from("orders")
          .delete()
          .eq("id", order.id);

        return NextResponse.json(
          {
            error:
              paymentInsertError.message ||
              "Unable to create payment record.",
          },
          { status: 500 }
        );
      }

      await supabaseAdmin()
        .from("orders")
        .update({
          payment_reference: reference,
          payment_status: "pending",
          payment_channel: "crypto",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      return NextResponse.json(
        {
          success: true,
          orderId: order.id,
          orderNumber,
          reference,
          trackingToken,
          orderCode,
          crypto: true,
          usdtAmount: usdAmount,
          amountNgn: total,
          wallet: process.env.USDT_WALLET_ADDRESS || null,
          network: process.env.USDT_NETWORK || "TRC20",
        },
        { status: 200 }
      );
    }

    const successParams = new URLSearchParams({
      order: order.id,
      reference,
    });

    if (trackingToken) {
      successParams.set("tracking", trackingToken);
    }

    if (orderCode) {
      successParams.set("code", orderCode);
    }

    const callbackUrl =
      `${appUrl}/checkout/success?${successParams.toString()}`;

    if (!getPaystackSecretKey()) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment provider is not configured.",
        },
        { status: 503 }
      );
    }

    const paystackBody: Record<string, unknown> = {
      email: customerEmail.trim(),
      amount: String(chargeAmount),
      currency: chargeCurrency,
      reference,
      callback_url: callbackUrl,
      metadata: {
        order_id: order.id,
        order_number: orderNumber,
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_type: deliveryType,
        payment_currency: chargeCurrency,
        amount_ngn: total,
      },
    };

    if (chargeCurrency === "NGN") {
      paystackBody.channels = ["card", "bank_transfer"];
    }

    async function openPaystack(body: Record<string, unknown>) {
      const response = await fetch(
        "https://api.paystack.co/transaction/initialize",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getPaystackSecretKey()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      return { response, data };
    }

    let { response: paystackResponse, data: paystackData } =
      await openPaystack(paystackBody);

    if (
      chargeCurrency === "NGN" &&
      (
        !paystackResponse.ok ||
        !paystackData?.status ||
        !paystackData?.data?.authorization_url
      ) &&
      /channel/i.test(String(paystackData?.message || ""))
    ) {
      delete paystackBody.channels;
      const retry = await openPaystack(paystackBody);
      paystackResponse = retry.response;
      paystackData = retry.data;
    }

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
      await supabaseAdmin()
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
       SAVE PAYMENT REFERENCE + PAYMENTS ROW
    ====================================================== */

    const paymentReference =
      paystackData.data.reference || reference;

    const {
      error: updateError,
    } = await supabaseAdmin()
      .from("orders")
      .update({
        payment_reference:
          paymentReference,

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

    const paymentInsertError = await insertPaymentRow({
      order_id: order.id,
      subscription_id: null,
      amount: chargeCurrency === "USD" ? usdAmount : total,
      currency: chargeCurrency,
      payment_method: "paystack",
      payment_provider: "paystack",
      payment_status: "pending",
      payment_reference: paymentReference,
      base_currency: "NGN",
      base_amount: total,
      exchange_rate: chargeCurrency === "USD" ? NGN_PER_USD : 1,
      paid_at: null,
      updated_at: new Date().toISOString(),
    });

    if (paymentInsertError) {
      console.error(
        "Payment record insert error:",
        paymentInsertError
      );

      await supabaseAdmin()
        .from("orders")
        .delete()
        .eq("id", order.id);

      return NextResponse.json(
        {
          error:
            paymentInsertError.message ||
            "Unable to create payment record.",
        },
        { status: 500 }
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
          paymentReference,

        trackingToken,

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
      await supabaseAdmin()
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