import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CartView } from "@/components/customer/cart-view";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "customer") redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
      <CartView />
    </div>
  );
}
