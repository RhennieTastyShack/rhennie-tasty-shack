import { orderAppreciation, thankYouNote } from "@/lib/thank-you-notes";

export type NotifyChannel = "email" | "sms" | "whatsapp";

export type NotifyEvent =
  | "OTP"
  | "WELCOME"
  | "ORDER_PAID"
  | "ORDER_STATUS"
  | "DELIVERY_STATUS";

export type NotifyTemplate = {
  title: string;
  sms: string;
  whatsapp: string;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
};

function formatMoney(amount: number | null | undefined) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function brandShell(title: string, bodyHtml: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#F8F6F2;font-family:Georgia,serif;color:#171717;">
    <div style="max-width:560px;margin:24px auto;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid rgba(0,0,0,0.08);">
      <div style="height:4px;background:#F26A21;"></div>
      <div style="padding:28px 28px 32px;">
        <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#F26A21;font-weight:700;font-family:Arial,sans-serif;">
          Rhennie Tasty Shack
        </p>
        <h1 style="margin:12px 0 0;font-size:26px;line-height:1.25;">${title}</h1>
        <div style="margin-top:18px;font-size:15px;line-height:1.7;color:#444;font-family:Arial,sans-serif;">
          ${bodyHtml}
        </div>
        <p style="margin-top:28px;font-size:12px;color:#999;font-family:Arial,sans-serif;">
          Premium taste · Fast delivery
        </p>
      </div>
    </div>
  </body>
</html>`;
}

export function buildOtpTemplate(code: string): NotifyTemplate {
  const title = "Your verification code";
  const sms = `Rhennie Tasty Shack: Your verification code is ${code}. It expires in 10 minutes.`;
  const whatsapp = sms;
  const emailSubject = "Your Rhennie Tasty Shack sign-in code";
  const emailText = `Your Rhennie Tasty Shack verification code is ${code}. It expires in 10 minutes. Enter this code on the website to finish signing in.`;
  const emailHtml = brandShell(
    title,
    `<p>Use this code to finish signing in to your Rhennie Tasty Shack account:</p>
     <p style="font-size:32px;letter-spacing:0.2em;font-weight:700;color:#F26A21;margin:20px 0;">${code}</p>
     <p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>`
  );

  return { title, sms, whatsapp, emailSubject, emailHtml, emailText };
}

export function buildWelcomeTemplate(name?: string): NotifyTemplate {
  const greeting = name ? `Welcome, ${name}` : "Welcome to Rhennie";
  const title = greeting;
  const sms =
    "Welcome to Rhennie Tasty Shack! Your account is verified. Order anytime from our menu.";
  const whatsapp = sms;
  const emailSubject = "Welcome to Rhennie Tasty Shack";
  const emailText =
    "Welcome to Rhennie Tasty Shack! Your account is verified. Browse the menu and place your first order.";
  const emailHtml = brandShell(
    title,
    `<p>Your email and phone are verified. You can now manage orders, meal plans, and celebrations in your client portal.</p>
     <p>We cannot wait to cook for you.</p>`
  );

  return { title, sms, whatsapp, emailSubject, emailHtml, emailText };
}

export function buildOrderPaidTemplate(data: {
  orderNo?: string | null;
  total?: number | null;
  trackingUrl?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const amount = formatMoney(data.total);
  const trackLine = data.trackingUrl
    ? ` Track delivery: ${data.trackingUrl}`
    : "";

  const note = thankYouNote();
  const appreciation = orderAppreciation();
  const title = "Payment confirmed";
  const sms = `Rhennie: Payment received for ${orderLabel} (${amount}). ${note}${trackLine}`;
  const whatsapp = sms;
  const emailSubject = `Payment confirmed — ${orderLabel}`;
  const emailText = `${appreciation} We received your payment for ${orderLabel} (${amount}). ${note}${trackLine}`;
  const emailHtml = brandShell(
    title,
    `<p>${appreciation}</p>
     <p>Payment for <strong>${orderLabel}</strong> (${amount}) was successful.</p>
     <p>${note}</p>
     ${
       data.trackingUrl
         ? `<p><a href="${data.trackingUrl}" style="color:#F26A21;font-weight:700;">Track your delivery</a></p>`
         : `<p>We will update you as your order progresses.</p>`
     }`
  );

  return { title, sms, whatsapp, emailSubject, emailHtml, emailText };
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
  const whatsapp = sms;
  const emailSubject = `${orderLabel} — ${status}`;
  const emailText = `Your order ${orderLabel} status is now: ${status}. ${note}`;
  const emailHtml = brandShell(
    title,
    `<p><strong>${orderLabel}</strong> is now <strong>${status}</strong>.</p>
     <p>${note}</p>
     <p>We will keep you posted on the next step.</p>`
  );

  return { title, sms, whatsapp, emailSubject, emailHtml, emailText };
}

export function buildDeliveryStatusTemplate(data: {
  orderNo?: string | null;
  status: string;
  trackingUrl?: string | null;
  riderName?: string | null;
}): NotifyTemplate {
  const orderLabel = data.orderNo || "your order";
  const statusLabel = data.status.replaceAll("_", " ");
  const rider = data.riderName ? ` Rider: ${data.riderName}.` : "";
  const trackLine = data.trackingUrl
    ? ` Track: ${data.trackingUrl}`
    : "";
  const note = thankYouNote();

  const title = `Delivery: ${statusLabel}`;
  const sms = `Rhennie delivery: ${orderLabel} is ${statusLabel}.${rider}${trackLine} ${note}`;
  const whatsapp = sms;
  const emailSubject = `Delivery update — ${orderLabel}`;
  const emailText = `Delivery for ${orderLabel} is now ${statusLabel}.${rider}${trackLine} ${note}`;
  const emailHtml = brandShell(
    title,
    `<p>Delivery for <strong>${orderLabel}</strong> is now <strong>${statusLabel}</strong>.</p>
     ${data.riderName ? `<p>Rider: ${data.riderName}</p>` : ""}
     ${
       data.trackingUrl
         ? `<p><a href="${data.trackingUrl}" style="color:#F26A21;font-weight:700;">Open tracking page</a></p>`
         : ""
     }
     <p>${note}</p>`
  );

  return { title, sms, whatsapp, emailSubject, emailHtml, emailText };
}
