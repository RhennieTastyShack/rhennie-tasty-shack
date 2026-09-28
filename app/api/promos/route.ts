import { NextResponse } from "next/server";
import { PROMOS, quotePromo } from "@/lib/promos";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") || "";
  const quote = quotePromo(code);

  return NextResponse.json({
    offers: PROMOS.map((promo) => ({
      code: promo.code,
      label: promo.label,
      percent: promo.percent,
      note: promo.note,
    })),
    quote: code.trim()
      ? {
          code: quote.code,
          percent: quote.percent,
          label: quote.label,
          error: quote.error,
        }
      : null,
  });
}
