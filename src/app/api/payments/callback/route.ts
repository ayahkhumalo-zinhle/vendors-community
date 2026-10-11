import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyPaymentReceived } from "@/lib/notifications";

type OrderWithProfile = { customer_id: string; profiles: { phone: string | null } | null };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const status = params.get("status");
  const reference = params.get("reference");
  const paynowRef = params.get("paynowreference");
  const amount = parseFloat(params.get("amount") ?? "0");

  if (!reference) return NextResponse.json({ ok: false }, { status: 400 });

  const supabase = createServiceClient();

  if (status?.toLowerCase() === "paid") {
    await supabase
      .from("orders")
      .update({ payment_status: "paid", paynow_ref: paynowRef, status: "confirmed" })
      .eq("id", reference);

    const { data: order } = await supabase
      .from("orders")
      .select("customer_id, profiles!customer_id(phone)")
      .eq("id", reference)
      .single();

    if (order) {
      const phone = (order as unknown as OrderWithProfile).profiles?.phone;
      if (phone) await notifyPaymentReceived(phone, amount, reference.slice(0, 8).toUpperCase());
    }
  } else if (status?.toLowerCase() === "failed" || status?.toLowerCase() === "cancelled") {
    await supabase.from("orders").update({ payment_status: "failed" }).eq("id", reference);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.redirect(new URL("/customer/orders", process.env.NEXT_PUBLIC_SITE_URL!));
}
