import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductRow } from "@/components/seller/product-row";
import { formatUSD } from "@/lib/format";
import type { Product } from "@/types";

export default async function SellerProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "seller") redirect("/dashboard");

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
  if (!seller) redirect("/seller/store");

  const { data: products } = await supabase
    .from("products").select("*").eq("seller_id", seller.id).order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products?.length ?? 0} product{products?.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/seller/products/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
          + Add product
        </Link>
      </div>

      {!products?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-500 text-sm">No products yet.</p>
          <Link href="/seller/products/new"
            className="mt-3 inline-block text-blue-600 font-medium text-sm hover:underline">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm">
          {products.map((p) => (
            <ProductRow key={p.id} product={p as Product} formatUSD={formatUSD} />
          ))}
        </div>
      )}
    </div>
  );
}
