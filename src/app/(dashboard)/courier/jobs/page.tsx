import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatUSD, formatDate } from "@/lib/format";
import { CourierJobActions } from "@/components/courier/courier-job-actions";
import type { OrderStatus } from "@/types";

export default async function CourierJobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "courier") redirect("/dashboard");

  const [{ data: available }, { data: mine }] = await Promise.all([
    supabase
      .from("orders")
      .select("*, sellers(business_name, city)")
      .is("courier_id", null)
      .in("status", ["confirmed", "preparing"])
      .order("created_at"),
    supabase
      .from("orders")
      .select("*, sellers(business_name, city)")
      .eq("courier_id", user.id)
      .not("status", "in", '("delivered","completed","cancelled")')
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Delivery Jobs</h1>

      <section>
        <h2 className="font-semibold text-slate-700 mb-3">My active deliveries ({mine?.length ?? 0})</h2>
        {!mine?.length ? (
          <p className="text-slate-400 text-sm">No active deliveries.</p>
        ) : (
          <div className="space-y-3">
            {mine.map((order) => (
              <div key={order.id} className="bg-white border border-blue-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-slate-800">{(order.sellers as { business_name: string; city: string } | null)?.business_name} &middot; {(order.sellers as { business_name: string; city: string } | null)?.city}</p>
                    <p className="text-slate-500 text-xs mt-0.5 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <OrderStatusBadge status={order.status as OrderStatus} />
                </div>
                <p className="text-sm text-slate-600"><span className="font-medium">Deliver to:</span> {order.delivery_address}</p>
                <CourierJobActions orderId={order.id} currentStatus={order.status as OrderStatus} courierId={user.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-slate-700 mb-3">Available jobs ({available?.length ?? 0})</h2>
        {!available?.length ? (
          <p className="text-slate-400 text-sm">No jobs available right now.</p>
        ) : (
          <div className="space-y-3">
            {available.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-medium text-slate-800">{(order.sellers as { business_name: string; city: string } | null)?.business_name} &middot; {(order.sellers as { business_name: string; city: string } | null)?.city}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <span className="font-semibold text-slate-900">{formatUSD(order.total_amount)}</span>
                </div>
                <p className="text-sm text-slate-600"><span className="font-medium">Deliver to:</span> {order.delivery_address}</p>
                <CourierJobActions orderId={order.id} currentStatus={order.status as OrderStatus} courierId={user.id} isAvailable />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
