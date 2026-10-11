import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatUSD, formatDate } from "@/lib/format";
import { SellerOrderActions } from "@/components/seller/seller-order-actions";
import type { OrderItem, OrderStatus } from "@/types";

export default async function SellerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "seller") redirect("/dashboard");

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
  if (!seller) redirect("/seller/store");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Incoming Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{orders?.length ?? 0} order{orders?.length !== 1 ? "s" : ""}</p>
      </div>

      {!orders?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-sm">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs text-slate-400 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <span className="font-semibold text-slate-900">{formatUSD(order.total_amount)}</span>
                </div>
              </div>

              <div className="text-sm text-slate-600 space-y-0.5">
                {(order.order_items as OrderItem[]).map((item) => (
                  <p key={item.id}>{item.quantity}× {item.product_name} — {formatUSD(item.unit_price)}</p>
                ))}
              </div>

              <p className="text-sm text-slate-500">
                <span className="font-medium">Deliver to:</span> {order.delivery_address}
              </p>

              <SellerOrderActions orderId={order.id} currentStatus={order.status as OrderStatus} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
