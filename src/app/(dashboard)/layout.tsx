import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopNav } from "@/components/layout/top-nav";
import { CartProvider } from "@/components/customer/cart-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50">
        <TopNav profile={profile} />
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </div>
    </CartProvider>
  );
}
