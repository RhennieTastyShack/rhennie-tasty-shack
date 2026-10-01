import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getRidePlatformCommissionPercent } from "@/lib/platform-settings";
import { splitDeliveryEarning } from "@/lib/ride-with-701";

export async function payRiderForDelivery(deliveryId: string) {
  const supabase = getSupabaseAdmin();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select(
      "id, order_id, rider_id, tip_amount, status, customer_delivery_charge, gross_delivery_earning, platform_commission_percent, platform_commission_amount, partner_net_earning"
    )
    .eq("id", deliveryId)
    .maybeSingle();

  if (!delivery?.rider_id || delivery.status !== "DELIVERED") return;

  const { data: existing } = await supabase
    .from("rider_payouts")
    .select("id")
    .eq("delivery_id", deliveryId)
    .maybeSingle();

  if (existing) return;

  const { data: order } = await supabase
    .from("orders")
    .select("delivery_fee, tip_amount, total")
    .eq("id", delivery.order_id)
    .maybeSingle();

  const { data: rider } = await supabase
    .from("riders")
    .select(
      "bank_name, bank_code, bank_account_name, bank_account_number, platform_fee_percent"
    )
    .eq("id", delivery.rider_id)
    .maybeSingle();

  const deliveryFee = Number(
    delivery.gross_delivery_earning ??
      delivery.customer_delivery_charge ??
      order?.delivery_fee ??
      0
  );
  const tip = Number(delivery.tip_amount || order?.tip_amount || 0);

  // Prefer commission snapshot stored at booking — do not recalculate history.
  const storedPercent = Number(delivery.platform_commission_percent);
  const storedPlatform = Number(delivery.platform_commission_amount);
  const storedPartner = Number(delivery.partner_net_earning);
  const hasSnapshot =
    Number.isFinite(storedPercent) &&
    storedPercent >= 0 &&
    Number.isFinite(storedPlatform) &&
    storedPlatform >= 0 &&
    Number.isFinite(storedPartner) &&
    storedPartner >= 0 &&
    deliveryFee > 0;

  let percent = storedPercent;
  let platformShare = storedPlatform;
  let riderFee = storedPartner;

  if (!hasSnapshot) {
    const commissionPercent = await getRidePlatformCommissionPercent();
    const split = splitDeliveryEarning(deliveryFee, commissionPercent);
    percent = split.percent;
    platformShare = split.platformShare;
    riderFee = split.partnerShare;
  }

  const amount = riderFee + tip;
  const commissionNote = `Rhennie Tasty Shack keeps ${percent}% of the Ride with 701 delivery fee (₦${platformShare.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) as platform commission. The delivery partner receives ₦${riderFee.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} plus the full tip of ₦${tip.toLocaleString("en-NG")}.`;

  await supabase
    .from("deliveries")
    .update({
      customer_delivery_charge: deliveryFee,
      gross_delivery_earning: deliveryFee,
      platform_commission_percent: percent,
      platform_commission_amount: platformShare,
      partner_net_earning: riderFee,
      updated_at: new Date().toISOString(),
    })
    .eq("id", deliveryId);

  let status = "pending";
  let providerReference: string | null = null;
  let note = `${commissionNote} Waiting to send it to the partner bank account.`;

  const account = String(rider?.bank_account_number || "").replace(/\D/g, "");
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!rider?.bank_code || account.length < 10) {
    note = `${commissionNote} Add a bank account in the delivery partner portal to receive this payout.`;
  } else if (secret && amount > 0) {
    try {
      const recipientResponse = await fetch(
        "https://api.paystack.co/transferrecipient",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "nuban",
            name: rider.bank_account_name || "Ride with 701 partner",
            account_number: account,
            bank_code: rider.bank_code,
            currency: "NGN",
          }),
        }
      );
      const recipient = await recipientResponse.json();
      const recipientCode = recipient?.data?.recipient_code;

      if (recipientCode) {
        const transferResponse = await fetch(
          "https://api.paystack.co/transfer",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secret}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: "balance",
              amount: Math.round(amount * 100),
              recipient: recipientCode,
              reason: `Ride with 701 delivery ${delivery.order_id}`,
            }),
          }
        );
        const transfer = await transferResponse.json();
        if (transfer?.status) {
          status = "paid";
          providerReference =
            transfer?.data?.transfer_code ||
            transfer?.data?.reference ||
            null;
          note = `${commissionNote} Sent to the partner bank account.`;
        } else {
          status = "failed";
          note = `${commissionNote} ${
            transfer?.message || "Bank transfer was not completed."
          }`;
        }
      } else {
        status = "failed";
        note = `${commissionNote} ${
          recipient?.message || "Bank account could not be verified."
        }`;
      }
    } catch {
      status = "failed";
      note = `${commissionNote} Bank transfer could not be started.`;
    }
  }

  const payout: Record<string, unknown> = {
    delivery_id: deliveryId,
    rider_id: delivery.rider_id,
    order_id: delivery.order_id,
    amount,
    delivery_fee: deliveryFee,
    platform_share: platformShare,
    rider_fee: riderFee,
    tip_amount: tip,
    status,
    bank_name: rider?.bank_name || null,
    bank_account_number: account || null,
    provider_reference: providerReference,
    note,
  };

  let error: { message?: string } | null = null;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const result = await supabase.from("rider_payouts").insert(payout);
    error = result.error;
    if (!error) break;

    const missing = String(error.message || "").match(
      /Could not find the '([^']+)' column|column [\w.]+\.(\w+) does not exist/i
    );
    const column = missing?.[1] || missing?.[2];
    if (!column || !(column in payout)) break;
    delete payout[column];
  }

  if (error) {
    console.error("Rider payout insert error:", error.message);
  }
}
