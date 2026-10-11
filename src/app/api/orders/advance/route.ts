import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyOrderStatus } from "@/lib/notifications";
import type { OrderStatus } from "@/types";

type OrderWithPhones = {
  id: string;
  customer: { phone: string | null } | null;
  courier: { phone: string | null } | null;
  seller: { user: { phone: string | null } | null } | null;
};

export async function POST(req: NextRequest) {
  const { orderId, nextStatus } = await req.json();
  if (!orderId || !nextStatus) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: nextStatus })
    .eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  supabase
    .from("orders")
    .select("id, customer:profiles!customer_id(phone), courier:profiles!courier_id(phone), seller:sellers!seller_id(user:profiles!user_id(phone))")
    .eq("id", orderId)
    .single()
    .then(({ data }) => {
      if (!data) return;
      const d = data as unknown as OrderWithPhones;
      notifyOrderStatus({
        status: nextStatus as OrderStatus,
        orderRef: orderId.slice(0, 8).toUpperCase(),
        customerPhone: d.customer?.phone,
        courierPhone: d.courier?.phone,
        sellerPhone: d.seller?.user?.phone,
      });
    });

  return NextResponse.json({ ok: true });
}
