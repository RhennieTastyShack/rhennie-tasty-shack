import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase-admin";
import { findBank } from "@/lib/banks";
import {
  confirmWalletTopup,
  readWallet,
  sendFromWallet,
  startTopup,
} from "@/lib/customer-wallet";

export const dynamic = "force-dynamic";

function money(value: unknown) {
  const amount = Math.round(Number(value));
  if (!Number.isFinite(amount) || amount < 100 || amount > 500000) {
    return null;
  }
  return amount;
}

export async function GET(request: Request) {
  const user = await getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Sign in to open your RTS wallet." },
      { status: 401 }
    );
  }

  const wallet = await readWallet(user.id);

  if (!wallet.snapshot) {
    return NextResponse.json(
      {
        success: false,
        missing: wallet.missing,
        message: wallet.missing
          ? "RTS wallet tables are not in the database yet. Run database/rts-wallet.sql in Supabase."
          : wallet.error || "Unable to open the RTS wallet.",
      },
      { status: wallet.missing ? 503 : 500 }
    );
  }

  return NextResponse.json({
    success: true,
    balance: wallet.snapshot.balance,
    held: wallet.snapshot.held,
    available: wallet.snapshot.available,
    ledger: wallet.ledger,
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);

  if (!user?.email) {
    return NextResponse.json(
      { success: false, message: "Sign in to use your RTS wallet." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body?.action || "");

  if (action === "confirm") {
    const reference = String(body?.reference || "").trim();
    const confirmed = await confirmWalletTopup(user.id, reference);

    return NextResponse.json(
      {
        success: confirmed.ok,
        pending: "pending" in confirmed ? confirmed.pending : false,
        message: confirmed.message,
      },
      { status: confirmed.ok ? 200 : 400 }
    );
  }

  const amount = money(body?.amount);

  if (!amount) {
    return NextResponse.json(
      { success: false, message: "Enter an amount from ₦100 to ₦500,000." },
      { status: 400 }
    );
  }

  if (action === "fund") {
    const started = await startTopup(user.id, amount);

    if (!started.ok) {
      return NextResponse.json(
        { success: false, message: started.message },
        { status: started.missing ? 503 : 400 }
      );
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Paystack is not connected for wallet funding." },
        { status: 500 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const channel = String(body?.channel || "");
    const channelAttempts =
      channel === "card"
        ? [["card"]]
        : channel === "bank"
          ? [["bank_transfer"], ["bank"]]
          : [];

    if (channelAttempts.length === 0) {
      return NextResponse.json(
        { success: false, message: "Choose card or bank to fund the wallet." },
        { status: 400 }
      );
    }

    let authorizationUrl = "";
    let paystackMessage = "Unable to start the wallet payment.";

    for (const channels of channelAttempts) {
      const paystack = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: String(amount * 100),
          currency: "NGN",
          reference: started.reference,
          callback_url: `${origin}/client-portal/wallet`,
          channels,
          metadata: { kind: "rts-wallet", user_id: user.id, channel },
        }),
      });

      const result = await paystack.json().catch(() => null);
      authorizationUrl = result?.data?.authorization_url || "";
      paystackMessage = result?.message || paystackMessage;

      if (paystack.ok && authorizationUrl) break;
      if (!/channel/i.test(paystackMessage)) break;
    }

    if (!authorizationUrl) {
      return NextResponse.json(
        { success: false, message: paystackMessage },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl,
      reference: started.reference,
    });
  }

  if (action === "withdraw" || action === "send") {
    const bank = findBank(String(body?.bankCode || ""));
    const accountNumber = String(body?.accountNumber || "").replace(/\D/g, "");
    const accountName = String(body?.accountName || "").trim();

    if (!bank || !accountName || accountNumber.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Choose a bank, then enter a 10-digit account number and the account name.",
        },
        { status: 400 }
      );
    }

    const sent = await sendFromWallet({
      userId: user.id,
      amount,
      bankName: bank.name,
      bankCode: bank.code,
      accountNumber,
      accountName,
    });

    if (!sent.ok) {
      return NextResponse.json(
        { success: false, message: sent.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      reference: sent.reference,
      message: sent.message,
    });
  }

  return NextResponse.json(
    { success: false, message: "Choose fund or withdraw." },
    { status: 400 }
  );
}
