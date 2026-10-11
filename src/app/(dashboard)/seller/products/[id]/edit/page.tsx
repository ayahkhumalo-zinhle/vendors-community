import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/seller/product-form";
import type { Product } from "@/types";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
  if (!seller) redirect("/seller/store");

  const { data: product } = await supabase
    .from("products").select("*").eq("id", id).eq("seller_id", seller.id).single();
  if (!product) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/seller/products" className="text-slate-400 hover:text-slate-700 transition-colors">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Edit product</h1>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ProductForm product={product as Product} />
      </div>
    </div>
  );
}
