import { NextRequest, NextResponse } from "next/server";
import {
  buildStatusHistoryEntry,
  canAdvanceDeliveryStatus,
  createTrackingToken,
  DeliveryMode,
  DeliveryStatus,
} from "@/lib/delivery";
import {
  cleanText,
  getAuthUser,
  getSupabaseAdmin,
  requireAdmin,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const token = cleanText(searchParams.get("token"));
    const orderId = cleanText(searchParams.get("order_id"));
    const scope = searchParams.get("scope") || "";

    if (token) {
      const deliveryFields = [
        "id",
        "order_id",
        "mode",
        "status",
        "tracking_token",
        "status_history",
        "external_rider_name",
        "external_rider_phone",
        "pickup_notes",
        "updated_at",
        "tip_amount",
        "rider_latitude",
        "rider_longitude",
        "location_updated_at",
      ];
      const riderFields = [
        "id",
        "full_name",
        "phone",
        "vehicle_type",
        "photo_path",
        "plate_number",
        "vehicle_color",
        "vehicle_model",
      ];
      const orderFields = `
            id,
            order_no,
            order_number,
            customer_name,
            customer_phone,
            delivery_address,
            delivery_type,
            total,
            amount,
            status,
            order_status,
            payment_status
      `;

      let data: any = null;
      let error: { message: string } | null = null;

      for (let attempt = 0; attempt < 16; attempt += 1) {
        const result = await supabaseAdmin
          .from("deliveries")
          .select(
            `
          ${deliveryFields.join(",\n")},
          riders (
            ${riderFields.join(",\n")}
          ),
          orders (
            ${orderFields}
          )
        `
          )
          .eq("tracking_token", token)
          .maybeSingle();

        data = result.data;
        error = result.error;

        if (!error) break;

        const message = error.message || "";
        const missing =
          message.match(/column [\w.]+\.(\w+) does not exist/i)?.[1] ||
          message.match(/Could not find the '([^']+)' column/i)?.[1];

        if (!missing) break;

        const deliveryIndex = deliveryFields.indexOf(missing);
        const riderIndex = riderFields.indexOf(missing);
        if (deliveryIndex >= 0) deliveryFields.splice(deliveryIndex, 1);
        else if (riderIndex >= 0) riderFields.splice(riderIndex, 1);
        else break;
      }

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { success: false, message: "Tracking link not found." },
          { status: 404 }
        );
      }

      const order = Array.isArray(data.orders)
        ? data.orders[0]
        : data.orders;

      const rider = Array.isArray(data.riders)
        ? data.riders[0]
        : data.riders;

      let photoUrl: string | null = null;
      if (rider?.photo_path) {
        const { data: signed } = await supabaseAdmin.storage
          .from("rider-documents")
          .createSignedUrl(rider.photo_path, 60 * 60);
        photoUrl = signed?.signedUrl || null;
      }

      return NextResponse.json({
        success: true,
        delivery: {
          id: data.id,
          mode: data.mode,
          status: data.status,
          tracking_token: data.tracking_token,
          tip_amount: data.tip_amount || 0,
          rider_latitude: data.rider_latitude ?? null,
          rider_longitude: data.rider_longitude ?? null,
          location_updated_at: data.location_updated_at || null,
          status_history: data.status_history,
          external_rider_name: data.external_rider_name,
          external_rider_phone: data.external_rider_phone,
          order: order
            ? {
                id: order.id,
                order_no: order.order_no || order.order_number,
                customer_name: order.customer_name
                  ? String(order.customer_name)
                      .split(" ")
                      .map((part: string, index: number) =>
                        index === 0 ? part : `${part.charAt(0)}.`
                      )
                      .join(" ")
                  : "Customer",
                delivery_address: order.delivery_address,
                total: order.total ?? order.amount,
                payment_status: order.payment_status,
              }
            : null,
          rider: rider
            ? {
                id: rider.id,
                full_name: rider.full_name,
                phone: rider.phone,
                vehicle_type: rider.vehicle_type,
                plate_number: rider.plate_number || null,
                vehicle_color: rider.vehicle_color || null,
                vehicle_model: rider.vehicle_model || null,
                photo_url: photoUrl,
              }
            : null,
        },
      });
    }

    if (scope === "mine") {
      const user = await getAuthUser(request);

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Please sign in." },
          { status: 401 }
        );
      }

      const { data: rider } = await supabaseAdmin
        .from("riders")
        .select("id, status")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!rider || rider.status !== "APPROVED") {
        return NextResponse.json(
          {
            success: false,
            message: "Approved rider profile required.",
          },
          { status: 403 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("deliveries")
        .select(
          `
          *,
          orders (
            id,
            order_no,
            order_number,
            customer_name,
            customer_phone,
            delivery_address,
            total,
            amount,
            payment_status
          )
        `
        )
        .eq("rider_id", rider.id)
        .neq("status", "CANCELLED")
        .order("updated_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        deliveries: (data || []).map((row) => {
          const delivery = { ...row } as Record<string, unknown>;
          delete delivery.order_code;
          return delivery;
        }),
      });
    }

    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Only the kitchen can view deliveries." },
        { status: 401 }
      );
    }

    if (orderId) {
      const { data, error } = await supabaseAdmin
        .from("deliveries")
        .select(
          `
          *,
          riders (
            id,
            full_name,
            phone,
            vehicle_type,
            status
          )
        `
        )
        .eq("order_id", orderId)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        delivery: data,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("deliveries")
      .select(
        `
        *,
        riders (
          id,
          full_name,
          phone,
          vehicle_type
        ),
        orders (
          id,
          order_no,
          order_number,
          customer_name,
          customer_phone,
          delivery_address,
          total,
          amount
        )
      `
      )
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
      deliveries: data || [],
    });
  } catch (error) {
    console.error("Deliveries GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load deliveries.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Only the kitchen can create a delivery." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const orderId = cleanText(body?.order_id);
    const mode = (cleanText(body?.mode).toUpperCase() ||
      "PLATFORM") as DeliveryMode;
    const externalRiderName = cleanText(body?.external_rider_name);
    const externalRiderPhone = cleanText(body?.external_rider_phone);
    const pickupNotes = cleanText(body?.pickup_notes);

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required." },
        { status: 400 }
      );
    }

    if (mode !== "CUSTOMER_DISPATCH" && mode !== "PLATFORM") {
      return NextResponse.json(
        { success: false, message: "Invalid delivery mode." },
        { status: 400 }
      );
    }

    if (
      mode === "CUSTOMER_DISPATCH" &&
      (!externalRiderName ||
        !externalRiderPhone ||
        externalRiderPhone.replace(/\D/g, "").length < 10)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Dispatch rider name and a valid phone number are required.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const initialStatus: DeliveryStatus =
      mode === "CUSTOMER_DISPATCH" ? "ASSIGNED" : "UNASSIGNED";

    const history = [
      buildStatusHistoryEntry(
        initialStatus,
        "system",
        mode === "CUSTOMER_DISPATCH"
          ? "Customer provided their own dispatch rider."
          : "Platform rider requested."
      ),
    ];

    const { data, error } = await supabaseAdmin
      .from("deliveries")
      .insert({
        order_id: orderId,
        mode,
        rider_id: null,
        external_rider_name:
          mode === "CUSTOMER_DISPATCH" ? externalRiderName : null,
        external_rider_phone:
          mode === "CUSTOMER_DISPATCH" ? externalRiderPhone : null,
        status: initialStatus,
        tracking_token: createTrackingToken(),
        status_history: history,
        pickup_notes: pickupNotes || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      delivery: data,
    });
  } catch (error) {
    console.error("Deliveries POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create delivery.",
      },
      { status: 500 }
    );
  }
}

async function syncOrderWithDelivery(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  orderId: string | null | undefined,
  deliveryStatus: string
) {
  if (!orderId) return;

  const orderStatus =
    deliveryStatus === "DELIVERED"
      ? "COMPLETED"
      : deliveryStatus === "PICKED_UP" || deliveryStatus === "ON_THE_WAY"
        ? "OUT FOR DELIVERY"
        : null;

  if (!orderStatus) return;

  const payload: Record<string, unknown> = {
    status: orderStatus,
    order_status: orderStatus,
    updated_at: new Date().toISOString(),
  };

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { error } = await supabaseAdmin
      .from("orders")
      .update(payload)
      .eq("id", orderId);

    if (!error) return;

    const missing = error.message.match(
      /Could not find the '([^']+)' column/i
    )?.[1];

    if (!missing || !(missing in payload)) return;
    delete payload[missing];
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const deliveryId = cleanText(body?.delivery_id);
    const nextStatus = cleanText(body?.status).toUpperCase() as DeliveryStatus;
    const riderId = cleanText(body?.rider_id);
    const latitude = Number(body?.latitude);
    const longitude = Number(body?.longitude);
    const note = cleanText(body?.note);
    const suppliedCode = cleanText(body?.order_code);

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, message: "Delivery ID is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: delivery, error: lookupError } = await supabaseAdmin
      .from("deliveries")
      .select("*")
      .eq("id", deliveryId)
      .single();

    if (lookupError || !delivery) {
      return NextResponse.json(
        { success: false, message: "Delivery not found." },
        { status: 404 }
      );
    }

    if (
      !riderId &&
      !nextStatus &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      const user = await getAuthUser(request);
      if (!user) {
        return NextResponse.json(
          { success: false, message: "Please sign in." },
          { status: 401 }
        );
      }

      const { data: rider } = await supabaseAdmin
        .from("riders")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!rider || rider.id !== delivery.rider_id) {
        return NextResponse.json(
          { success: false, message: "Only the assigned rider can share location." },
          { status: 403 }
        );
      }

      const locationUpdate: Record<string, unknown> = {
        rider_latitude: latitude,
        rider_longitude: longitude,
        location_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (delivery.status === "PICKED_UP") {
        const history = Array.isArray(delivery.status_history)
          ? [...delivery.status_history]
          : [];
        history.push(
          buildStatusHistoryEntry(
            "ON_THE_WAY",
            "system",
            "Started delivery after pickup"
          )
        );
        locationUpdate.status = "ON_THE_WAY";
        locationUpdate.status_history = history;
      }

      const { error } = await supabaseAdmin
        .from("deliveries")
        .update(locationUpdate)
        .eq("id", delivery.id);

      if (!error && locationUpdate.status === "ON_THE_WAY") {
        await syncOrderWithDelivery(
          supabaseAdmin,
          delivery.order_id,
          "ON_THE_WAY"
        );
        try {
          const { notifyDeliveryStatusChange } = await import(
            "@/lib/notify/hooks"
          );
          void notifyDeliveryStatusChange(delivery.id);
        } catch (notifyError) {
          console.error("Delivery status notify error:", notifyError);
        }
      }

      if (error) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please sign in." },
        { status: 401 }
      );
    }

    const kitchen = await requireAdmin(request);
    let actor = "admin";

    if (!kitchen) {
      const { data: rider } = await supabaseAdmin
        .from("riders")
        .select("id, status")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (
        !rider ||
        rider.status !== "APPROVED" ||
        rider.id !== delivery.rider_id
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Only the kitchen or the assigned rider can update this delivery.",
          },
          { status: 403 }
        );
      }

      if (riderId) {
        return NextResponse.json(
          {
            success: false,
            message: "Only the kitchen can assign a rider.",
          },
          { status: 403 }
        );
      }

      actor = "rider";
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const history = Array.isArray(delivery.status_history)
      ? [...delivery.status_history]
      : [];

    // Assign platform rider
    if (riderId) {
      const { data: rider, error: riderError } = await supabaseAdmin
        .from("riders")
        .select("id, status, full_name")
        .eq("id", riderId)
        .maybeSingle();

      if (riderError || !rider || rider.status !== "APPROVED") {
        return NextResponse.json(
          {
            success: false,
            message: "Only approved riders can be assigned.",
          },
          { status: 400 }
        );
      }

      updateData.rider_id = riderId;
      updateData.mode = "PLATFORM";
      updateData.status = "ASSIGNED";
      history.push(
        buildStatusHistoryEntry(
          "ASSIGNED",
          actor,
          note || `Assigned to ${rider.full_name}`
        )
      );
    }

    if (nextStatus === "DELIVERED") {
      if (!delivery.order_code || suppliedCode !== String(delivery.order_code)) {
        return NextResponse.json(
          {
            success: false,
            message: "Enter the customer's delivery code before completing the drop-off.",
          },
          { status: 400 }
        );
      }
    }

    if (nextStatus) {
      if (
        !canAdvanceDeliveryStatus(
          delivery.status as DeliveryStatus,
          nextStatus
        ) &&
        !riderId
      ) {
        if (actor !== "admin") {
          return NextResponse.json(
            {
              success: false,
              message: `Cannot move from ${delivery.status} to ${nextStatus}.`,
            },
            { status: 400 }
          );
        }
      }

      if (nextStatus === "PICKED_UP") {
        history.push(
          buildStatusHistoryEntry(
            "PICKED_UP",
            actor,
            note || "Order picked up"
          )
        );
        history.push(
          buildStatusHistoryEntry(
            "ON_THE_WAY",
            "system",
            "Started delivery after pickup"
          )
        );
        updateData.status = "ON_THE_WAY";
      } else {
        updateData.status = nextStatus;
        history.push(
          buildStatusHistoryEntry(nextStatus, actor, note || undefined)
        );
      }
    }

    if (body?.external_rider_name !== undefined) {
      updateData.external_rider_name =
        cleanText(body.external_rider_name) || null;
    }

    if (body?.external_rider_phone !== undefined) {
      updateData.external_rider_phone =
        cleanText(body.external_rider_phone) || null;
    }

    updateData.status_history = history;

    const { data, error } = await supabaseAdmin
      .from("deliveries")
      .update(updateData)
      .eq("id", deliveryId)
      .select(
        `
        *,
        riders (
          id,
          full_name,
          phone,
          vehicle_type
        )
      `
      )
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      );
    }

    const previousStatus = delivery.status as string;
    const newStatus = String(data.status || "");

    if (newStatus && newStatus !== previousStatus) {
      await syncOrderWithDelivery(
        supabaseAdmin,
        data.order_id || delivery.order_id,
        newStatus
      );
    }

    if (newStatus === "DELIVERED" && previousStatus !== "DELIVERED") {
      try {
        const { payRiderForDelivery } = await import("@/lib/rider-payout");
        void payRiderForDelivery(data.id);
      } catch (payoutError) {
        console.error("Rider payout error:", payoutError);
      }
    }

    if (
      newStatus &&
      newStatus !== previousStatus &&
      ["ASSIGNED", "PICKED_UP", "ON_THE_WAY", "DELIVERED"].includes(
        newStatus
      )
    ) {
      try {
        const { notifyDeliveryStatusChange } = await import(
          "@/lib/notify/hooks"
        );
        void notifyDeliveryStatusChange(data.id);
      } catch (notifyError) {
        console.error("Delivery status notify error:", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      delivery: data,
    });
  } catch (error) {
    console.error("Deliveries PATCH error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update delivery.",
      },
      { status: 500 }
    );
  }
}
