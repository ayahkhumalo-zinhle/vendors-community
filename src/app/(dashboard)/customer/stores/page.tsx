import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreCard } from "@/components/customer/store-card";
import type { Seller } from "@/types";

export default async function BrowseStoresPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "customer") redirect("/dashboard");

  const { data: stores } = await supabase
    .from("sellers")
    .select("*")
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Stores</h1>
        <p className="text-slate-500 text-sm mt-1">{stores?.length ?? 0} store{stores?.length !== 1 ? "s" : ""} open now</p>
      </div>

      {!stores?.length ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-2xl mb-2">🏪</p>
          <p className="text-slate-500 text-sm">No stores are open right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store as Seller} />
          ))}
        </div>
      )}
    </div>
  );
}
