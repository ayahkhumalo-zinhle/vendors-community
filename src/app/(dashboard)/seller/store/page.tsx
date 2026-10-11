import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreForm } from "@/components/seller/store-form";
import type { Seller } from "@/types";

export default async function SellerStorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "seller") redirect("/dashboard");

  const { data: seller } = await supabase
    .from("sellers").select("*").eq("user_id", user.id).single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {seller ? "My Store" : "Set up your store"}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {seller ? "Edit your store details" : "Fill in your business details to start selling"}
        </p>
      </div>

      {seller && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
          seller.is_open ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full ${seller.is_open ? "bg-green-500" : "bg-slate-400"}`} />
          <span className="text-sm font-medium text-slate-700">
            Store is currently <strong>{seller.is_open ? "Open" : "Closed"}</strong>
          </span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <StoreForm defaultValues={seller as Seller | null} />
      </div>
    </div>
  );
}
