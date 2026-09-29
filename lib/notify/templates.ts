import { getDeliveryStatusLabel } from "@/lib/delivery";
import { orderAppreciation, thankYouNote } from "@/lib/thank-you-notes";

export type NotifyChannel = "email" | "sms" | "whatsapp";

export type NotifyEvent =
  | "OTP"
  | "WELCOME"
  | "PASSWORD_RESET"
  | "PASSWORD_CHANGED"
  | "ORDER_PAID"
  | "ORDER_STATUS"
  | "PICKUP_READY"
  | "OWN_RIDER_CODE"
  | "DELIVERY_STATUS"
  | "PARTNER_REGISTERED"
  | "PARTNER_STATUS";

export type OrderEmailItem = {
  name: string;
  quantity: number;
  unitPrice?: number | null;
  lineTotal?: number | null;
};

export type NotifyTemplate = {
  title: string;
  sms: string;
  whatsapp: string;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
};

export function formatMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function escapeHtml(value: string) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Premium RTS transactional shell — black, warm gold, cream. Lightweight CSS. */
function brandShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#F7F3EA;font-family:Georgia,'Times New Roman',serif;color:#111111;">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border:1px solid rgba(0,0,0,0.08);">
      <div style="background:#0B0B0B;padding:22px 28px;">
        <p style="margin:0;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#D4AF37;font-weight:700;font-family:Arial,Helvetica,sans-serif;">
          Rhennie Tasty Shack
        </p>
        <h1 style="margin:10px 0 0;font-size:24px;line-height:1.3;color:#FFFFFF;font-weight:400;">
          ${escapeHtml(title)}
        </h1>
      </div>
      <div style="height:3px;background:#D4AF37;"></div>
      <div style="padding:28px;font-size:15px;line-height:1.7;color:#333333;font-family:Arial,Helvetica,sans-serif;">
        ${bodyHtml}
        <p style="margin-top:28px;font-size:12px;color:#888888;">
          Rhennie Tasty Shack · Premium taste
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export function buildOtpTemplate(code: string): NotifyTemplate {
  const title = "Your verification code";
  const sms = `Rhennie Tasty Shack: Your verification code is ${code}. It expires in 10 minutes.`;
  const emailSubject = "Your Rhennie Tasty Shack verification code";
  const emailText = `Your Rhennie Tasty Shack verification code is ${code}. It expires in 10 minutes. Enter this code on the website to finish signing in.`;
  const emailHtml = brandShell(
    title,
    `<p>Use this code to finish signing in to your account:</p>
     <p style="font-size:32px;letter-spacing:0.22em;font-weight:700;color:#0B0B0B;margin:20px 0;">${escapeHtml(code)}</p>
     <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildWelcomeTemplate(name?: string): NotifyTemplate {
  const title = name ? `Welcome, ${name}` : "Welcome to Rhennie";
  const sms =
    "Welcome to Rhennie Tasty Shack! Your account is verified. Order anytime from our menu.";
  const emailSubject = "Welcome to Rhennie Tasty Shack";
  const emailText =
    "Welcome to Rhennie Tasty Shack! Your account is verified. Browse the menu and place your first order.";
  const emailHtml = brandShell(
    title,
    `<p>Your account is verified. You can manage orders, meal plans, and celebrations in your client portal.</p>
     <p>We cannot wait to cook for you.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildPasswordResetTemplate(resetUrl: string): NotifyTemplate {
  const title = "Reset your password";
  const sms = "Rhennie: Use the password reset link sent to your email.";
  const emailSubject = "Reset your Rhennie Tasty Shack password";
  const emailText = `Reset your Rhennie Tasty Shack password using this secure link:\n\n${resetUrl}\n\nIf you did not ask for this, you can ignore this email.`;
  const emailHtml = brandShell(
    title,
    `<p>We received a request to reset your password.</p>
     <p style="margin:24px 0;">
       <a href="${escapeHtml(resetUrl)}" style="display:inline-block;background:#0B0B0B;color:#D4AF37;text-decoration:none;padding:12px 22px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
         Choose a new password
       </a>
     </p>
     <p style="font-size:13px;color:#666;">If the button does not work, copy this link:<br>${escapeHtml(resetUrl)}</p>
     <p>If you did not ask for this, you can ignore this email.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildPasswordChangedTemplate(): NotifyTemplate {
  const title = "Password updated";
  const sms = "Rhennie: Your account password was changed successfully.";
  const emailSubject = "Your Rhennie password was updated";
  const emailText =
    "Your Rhennie Tasty Shack password was updated successfully. If you did not make this change, reset your password immediately and contact support.";
  const emailHtml = brandShell(
    title,
    `<p>Your password was updated successfully.</p>
     <p>If you did not make this change, reset your password immediately using Forgot password on the sign-in page.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildOrderPaidTemplate(data: {
  orderNo?: string | null;
  customerName?: string | null;
  total?: number | null;
  subtotal?: number | null;
  deliveryFee?: number | null;
  tipAmount?: number | null;
  fulfilmentMethod?: string | null;
  deliveryType?: string | null;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  pickupCode?: string | null;
  pickupLocation?: string | null;
  items?: OrderEmailItem[];
  trackingUrl?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const amount = formatMoney(data.total);
  const note = thankYouNote();
  const appreciation = orderAppreciation();
  const fulfilment = String(
    data.fulfilmentMethod || data.deliveryType || "order"
  )
    .replaceAll("_", " ")
    .trim();

  const itemLines =
    data.items && data.items.length > 0
      ? data.items
          .map((item) => {
            const qty = Math.max(1, Number(item.quantity) || 1);
            const line = formatMoney(
              item.lineTotal ?? Number(item.unitPrice || 0) * qty
            );
            return `${qty} × ${item.name} — ${line}`;
          })
          .join("\n")
      : "";

  const itemHtml =
    data.items && data.items.length > 0
      ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          ${data.items
            .map((item) => {
              const qty = Math.max(1, Number(item.quantity) || 1);
              const line = formatMoney(
                item.lineTotal ?? Number(item.unitPrice || 0) * qty
              );
              return `<tr>
                <td style="padding:8px 0;border-bottom:1px solid #eee;">${qty} × ${escapeHtml(item.name)}</td>
                <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${line}</td>
              </tr>`;
            })
            .join("")}
        </table>`
      : "";

  const pickupBlock =
    data.pickupCode &&
    (data.fulfilmentMethod === "pickup" ||
      data.fulfilmentMethod === "own_rider" ||
      data.deliveryType === "pickup")
      ? {
          html: `<div style="margin:18px 0;padding:16px;background:#F7F3EA;border:1px solid rgba(212,175,55,0.35);">
            <p style="margin:0;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8A6D1F;font-weight:700;">Secure pickup code</p>
            <p style="margin:10px 0 0;font-size:28px;letter-spacing:0.18em;font-weight:700;">${escapeHtml(data.pickupCode)}</p>
            <p style="margin:10px 0 0;font-size:13px;color:#555;">
              ${
                data.fulfilmentMethod === "own_rider"
                  ? "Give this code to your rider. It is required before the kitchen releases your order."
                  : "Present this code when you collect your order."
              }
            </p>
            ${
              data.pickupLocation
                ? `<p style="margin:8px 0 0;font-size:13px;">Pickup location: ${escapeHtml(data.pickupLocation)}</p>`
                : ""
            }
          </div>`,
          text: `\nSecure pickup code: ${data.pickupCode}\n${
            data.fulfilmentMethod === "own_rider"
              ? "Give this code to your rider before collection."
              : "Present this code when you collect your order."
          }${data.pickupLocation ? `\nPickup location: ${data.pickupLocation}` : ""}\n`,
        }
      : null;

  const title = "Order confirmed";
  const sms = `Rhennie: Payment received for ${orderLabel} (${amount}). ${note}`;
  const emailSubject = `Order confirmed — ${orderLabel}`;
  const emailText = `${appreciation}

Order ${orderLabel}
Payment: ${data.paymentStatus || "paid"} · ${amount}
Fulfilment: ${fulfilment}
${itemLines ? `\nItems:\n${itemLines}\n` : ""}
Food subtotal: ${formatMoney(data.subtotal)}
Delivery: ${formatMoney(data.deliveryFee)}
${Number(data.tipAmount || 0) > 0 ? `Tip: ${formatMoney(data.tipAmount)}\n` : ""}Total: ${amount}
${data.paymentReference ? `Reference: ${data.paymentReference}\n` : ""}${pickupBlock?.text || ""}${
    data.trackingUrl ? `\nTrack delivery: ${data.trackingUrl}` : ""
  }

${note}`;

  const emailHtml = brandShell(
    title,
    `<p>${escapeHtml(appreciation)}</p>
     <p>Thank you${data.customerName ? `, ${escapeHtml(data.customerName)}` : ""}. Payment for <strong>${escapeHtml(orderLabel)}</strong> was successful.</p>
     <p style="margin:0;"><strong>Fulfilment:</strong> ${escapeHtml(fulfilment)}</p>
     <p style="margin:6px 0 0;"><strong>Payment status:</strong> ${escapeHtml(String(data.paymentStatus || "paid"))}</p>
     ${itemHtml}
     <p style="margin:0;">Food subtotal: <strong>${formatMoney(data.subtotal)}</strong></p>
     <p style="margin:4px 0 0;">Delivery: <strong>${formatMoney(data.deliveryFee)}</strong></p>
     ${
       Number(data.tipAmount || 0) > 0
         ? `<p style="margin:4px 0 0;">Tip: <strong>${formatMoney(data.tipAmount)}</strong></p>`
         : ""
     }
     <p style="margin:8px 0 0;font-size:18px;">Total paid: <strong>${amount}</strong></p>
     ${
       data.paymentReference
         ? `<p style="font-size:13px;color:#666;">Reference: ${escapeHtml(data.paymentReference)}</p>`
         : ""
     }
     ${pickupBlock?.html || ""}
     ${
       data.trackingUrl
         ? `<p><a href="${escapeHtml(data.trackingUrl)}" style="color:#8A6D1F;font-weight:700;">Track your delivery</a></p>`
         : `<p>We will update you as your order progresses.</p>`
     }
     <p>${escapeHtml(note)}</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildOrderStatusTemplate(data: {
  orderNo?: string | null;
  status: string;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const status = data.status.replaceAll("_", " ");
  const note = thankYouNote();
  const title = `Order update: ${status}`;
  const sms = `Rhennie: ${orderLabel} is now ${status}. ${note}`;
  const emailSubject = `${orderLabel} — ${status}`;
  const emailText = `Your order ${orderLabel} status is now: ${status}. ${note}`;
  const emailHtml = brandShell(
    title,
    `<p><strong>${escapeHtml(orderLabel)}</strong> is now <strong>${escapeHtml(status)}</strong>.</p>
     <p>${escapeHtml(note)}</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildPickupReadyTemplate(data: {
  orderNo?: string | null;
  pickupCode?: string | null;
  pickupLocation?: string | null;
  instructions?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const title = "Ready for pickup";
  const sms = `Rhennie: ${orderLabel} is ready for pickup. Bring your pickup code.`;
  const emailSubject = `${orderLabel} is ready for pickup`;
  const emailText = `${orderLabel} is ready for pickup.
${data.pickupLocation ? `Location: ${data.pickupLocation}\n` : ""}${
    data.pickupCode ? `Pickup code: ${data.pickupCode}\n` : ""
  }${data.instructions || "Please bring your secure pickup code to collect your order."}`;

  const emailHtml = brandShell(
    title,
    `<p><strong>${escapeHtml(orderLabel)}</strong> is ready for pickup.</p>
     ${
       data.pickupLocation
         ? `<p><strong>Pickup location:</strong> ${escapeHtml(data.pickupLocation)}</p>`
         : ""
     }
     ${
       data.pickupCode
         ? `<p style="font-size:28px;letter-spacing:0.18em;font-weight:700;margin:18px 0;">${escapeHtml(data.pickupCode)}</p>
            <p>Present this code before food is released.</p>`
         : ""
     }
     <p>${escapeHtml(
       data.instructions ||
         "Please bring your secure pickup code to collect your order."
     )}</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildOwnRiderTemplate(data: {
  orderNo?: string | null;
  pickupCode?: string | null;
  pickupLocation?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const title = "Send your own rider";
  const sms = `Rhennie: ${orderLabel} pickup code ready for your courier.`;
  const emailSubject = `${orderLabel} — own rider pickup code`;
  const emailText = `Order ${orderLabel}
Your courier must present this pickup code before the kitchen releases the food.
${data.pickupCode ? `Pickup code: ${data.pickupCode}\n` : ""}${
    data.pickupLocation ? `Location: ${data.pickupLocation}\n` : ""
  }This is not a Ride with 701 delivery.`;

  const emailHtml = brandShell(
    title,
    `<p>Order <strong>${escapeHtml(orderLabel)}</strong> will be released to your courier only after the pickup code is verified.</p>
     ${
       data.pickupCode
         ? `<p style="font-size:28px;letter-spacing:0.18em;font-weight:700;margin:18px 0;">${escapeHtml(data.pickupCode)}</p>`
         : ""
     }
     ${
       data.pickupLocation
         ? `<p><strong>Pickup location:</strong> ${escapeHtml(data.pickupLocation)}</p>`
         : ""
     }
     <p>This is not a Ride with 701 delivery. Give the code only to your trusted rider.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

const CUSTOMER_DELIVERY_EMAIL_STATUSES = new Set([
  "ASSIGNED",
  "PICKED_UP",
  "ON_THE_WAY",
  "ARRIVED_AT_CUSTOMER",
  "DELIVERED",
]);

export function shouldEmailDeliveryStatus(status: string) {
  return CUSTOMER_DELIVERY_EMAIL_STATUSES.has(String(status || "").toUpperCase());
}

export function buildDeliveryStatusTemplate(data: {
  orderNo?: string | null;
  status: string;
  trackingUrl?: string | null;
  riderName?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const statusLabel = getDeliveryStatusLabel(data.status);
  const rider = data.riderName ? ` Partner: ${data.riderName}.` : "";
  const trackLine = data.trackingUrl ? ` Track: ${data.trackingUrl}` : "";
  const note = thankYouNote();

  const title = `Ride with 701 · ${statusLabel}`;
  const sms = `Rhennie Ride with 701: ${orderLabel} is ${statusLabel}.${rider}${trackLine}`;
  const emailSubject = `Ride with 701 — ${orderLabel}`;
  const emailText = `Ride with 701 update for ${orderLabel}: ${statusLabel}.${rider}${trackLine} ${note}`;
  const emailHtml = brandShell(
    title,
    `<p>Delivery for <strong>${escapeHtml(orderLabel)}</strong> is now <strong>${escapeHtml(statusLabel)}</strong>.</p>
     ${data.riderName ? `<p>Delivery partner: ${escapeHtml(data.riderName)}</p>` : ""}
     ${
       data.trackingUrl
         ? `<p><a href="${escapeHtml(data.trackingUrl)}" style="color:#8A6D1F;font-weight:700;">Open tracking page</a></p>`
         : ""
     }
     <p>${escapeHtml(note)}</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildPartnerRegisteredTemplate(data: {
  name?: string | null;
}): NotifyTemplate {
  const title = "Application received";
  const sms =
    "Ride with 701: We received your delivery partner application. Rhennie Studio will review it.";
  const emailSubject = "Ride with 701 — application received";
  const emailText = `Hello${data.name ? ` ${data.name}` : ""},

We received your Ride with 701 delivery partner application. Rhennie Studio will review your details and documents. You will get another email when your status changes.

Do not share identity documents by email.`;

  const emailHtml = brandShell(
    title,
    `<p>Hello${data.name ? ` ${escapeHtml(data.name)}` : ""},</p>
     <p>We received your <strong>Ride with 701</strong> delivery partner application.</p>
     <p>Rhennie Studio will review your details. You will receive another email when your application status changes.</p>
     <p style="font-size:13px;color:#666;">Never send government IDs, bank details, or verification media by email.</p>`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}

export function buildPartnerStatusTemplate(data: {
  name?: string | null;
  status: string;
  note?: string | null;
}): NotifyTemplate {
  const status = String(data.status || "").toUpperCase();
  const label =
    status === "APPROVED"
      ? "Application approved"
      : status === "REJECTED"
        ? "Application update"
        : status === "SUSPENDED"
          ? "Account suspended"
          : status === "UNDER_REVIEW" || status === "PENDING"
            ? "Application under review"
            : `Application ${status.replaceAll("_", " ").toLowerCase()}`;

  const guidance =
    status === "APPROVED"
      ? "You can sign in to the Ride with 701 partner portal and go online when you are ready to accept jobs."
      : status === "REJECTED"
        ? "Please review the note from Rhennie Studio and resubmit any required information from your partner portal."
        : status === "SUSPENDED"
          ? "Your partner account cannot receive delivery jobs until Rhennie Studio reactivates it."
          : "Rhennie Studio is reviewing your application.";

  const title = label;
  const sms = `Ride with 701: ${label}. ${guidance}`;
  const emailSubject = `Ride with 701 — ${label}`;
  const emailText = `Hello${data.name ? ` ${data.name}` : ""},

${label}.
${guidance}
${data.note ? `\nNote: ${data.note}\n` : ""}
No identity documents are included in this email.`;

  const emailHtml = brandShell(
    title,
    `<p>Hello${data.name ? ` ${escapeHtml(data.name)}` : ""},</p>
     <p><strong>${escapeHtml(label)}</strong></p>
     <p>${escapeHtml(guidance)}</p>
     ${
       data.note
         ? `<p style="margin-top:16px;padding:12px;background:#F7F3EA;"><strong>Note:</strong> ${escapeHtml(data.note)}</p>`
         : ""
     }`
  );

  return { title, sms, whatsapp: sms, emailSubject, emailHtml, emailText };
}
