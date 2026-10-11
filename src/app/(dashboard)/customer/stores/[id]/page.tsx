import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/customer/add-to-cart-button";
import { formatUSD } from "@/lib/format";
import type { Product, Seller } from "@/types";

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "customer") redirect("/dashboard");

  const { data: store } = await supabase.from("sellers").select("*").eq("id", id).single();
  if (!store) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", id)
    .eq("is_available", true)
    .order("category")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/customer/stores" className="text-slate-400 hover:text-slate-700 transition-colors">
          ← Stores
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{(store as Seller).business_name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{(store as Seller).business_type} · {(store as Seller).city}</p>
            {(store as Seller).address && (
              <p className="text-slate-400 text-xs mt-1">{(store as Seller).address}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Open
          </span>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-slate-800 mb-3">Menu</h2>
        {!products?.length ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <p className="text-slate-400 text-sm">No products available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{p.name}</p>
                  {p.description && (
                    <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{p.description}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1 capitalize">{p.category}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold text-slate-900">{formatUSD(p.price)}</p>
                  <AddToCartButton product={p as Product} sellerId={store.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
