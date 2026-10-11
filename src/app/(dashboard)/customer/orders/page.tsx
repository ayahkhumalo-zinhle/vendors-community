import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatUSD, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/types";

export default async function CustomerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "customer") redirect("/dashboard");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, sellers(business_name)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>

      {!orders?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-2xl mb-2">🛍️</p>
          <p className="text-slate-500 text-sm">No orders yet.</p>
          <Link href="/customer/stores" className="mt-3 inline-block text-blue-600 font-medium text-sm hover:underline">
            Browse stores →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`}
              className="block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-slate-800">
                    {(order.sellers as { business_name: string } | null)?.business_name ?? "Store"}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <OrderStatusBadge status={order.status as OrderStatus} />
                  <p className="font-semibold text-slate-900 mt-1">{formatUSD(order.total_amount)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
