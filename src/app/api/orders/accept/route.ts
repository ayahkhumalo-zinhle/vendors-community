import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyOrderStatus } from "@/lib/notifications";

type OrderPhones = {
  id: string;
  customer: { phone: string | null } | null;
  courier: { phone: string | null } | null;
};

export async function POST(req: NextRequest) {
  const { orderId, courierId } = await req.json();
  if (!orderId || !courierId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ courier_id: courierId, status: "courier_assigned" })
    .eq("id", orderId)
    .is("courier_id", null);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  supabase
    .from("orders")
    .select("id, customer:profiles!customer_id(phone), courier:profiles!courier_id(phone)")
    .eq("id", orderId)
    .single()
    .then(({ data }) => {
      if (!data) return;
      const d = data as unknown as OrderPhones;
      notifyOrderStatus({
        status: "courier_assigned",
        orderRef: orderId.slice(0, 8).toUpperCase(),
        customerPhone: d.customer?.phone,
        courierPhone: d.courier?.phone,
      });
    });

  return NextResponse.json({ ok: true });
}
