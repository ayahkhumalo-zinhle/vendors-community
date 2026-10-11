import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { RealtimeOrderStatus } from "@/components/orders/realtime-order-status";
import { formatUSD, formatDate } from "@/lib/format";
import type { OrderItem, OrderStatus } from "@/types";

const PAYMENT_ICONS: Record<string, string> = { ecocash: "📱", zipit: "🏦", card: "💳" };
const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-700",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), sellers(business_name, city)")
    .eq("id", id)
    .eq("customer_id", user.id)
    .single();

  if (!order) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <RealtimeOrderStatus orderId={id} />

      <div className="flex items-center gap-3">
        <Link href="/customer/orders" className="text-slate-400 hover:text-slate-700 transition-colors">
          &larr; Orders
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs text-slate-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="font-semibold text-slate-900 mt-0.5">{(order.sellers as { business_name: string; city: string } | null)?.business_name}</p>
            <p className="text-slate-500 text-sm">{(order.sellers as { business_name: string; city: string } | null)?.city}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <OrderStatusBadge status={order.status as OrderStatus} />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PAYMENT_STATUS_STYLES[order.payment_status ?? "pending"]}`}>
              {PAYMENT_ICONS[order.payment_method ?? "card"]} {order.payment_status ?? "payment pending"}
            </span>
          </div>
        </div>

        {order.payment_status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
            {order.payment_method === "ecocash" || order.payment_method === "zipit"
              ? "Check your phone for a USSD payment prompt to complete your order."
              : "Complete your payment to confirm this order."}
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 space-y-1.5">
          {(order.order_items as OrderItem[]).map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-slate-700">{item.quantity}&times; {item.product_name}</span>
              <span className="text-slate-600">{formatUSD(item.unit_price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-semibold text-slate-900 pt-2 border-t border-slate-100">
            <span>Total</span>
            <span>{formatUSD(order.total_amount)}</span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-1 text-sm text-slate-600">
          <p><span className="font-medium">Deliver to:</span> {order.delivery_address}</p>
          {order.notes && <p><span className="font-medium">Notes:</span> {order.notes}</p>}
          <p><span className="font-medium">Placed:</span> {formatDate(order.created_at)}</p>
        </div>
      </div>
    </div>
  );
}
