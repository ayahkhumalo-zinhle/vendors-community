import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

const ROLE_LINKS: Record<UserRole, { href: string; icon: string; label: string; desc: string }[]> = {
  seller: [
    { href: "/seller/store",    icon: "🏪", label: "My Store",    desc: "Edit details & hours" },
    { href: "/seller/products", icon: "📦", label: "Products",    desc: "Add & manage listings" },
    { href: "/seller/orders",   icon: "📋", label: "Orders",      desc: "View incoming orders" },
    { href: "/profile",         icon: "👤", label: "Profile",     desc: "Name, phone, EcoCash" },
  ],
  customer: [
    { href: "/customer/stores", icon: "🏪", label: "Browse Stores", desc: "Find & order food" },
    { href: "/customer/cart",   icon: "🛒", label: "My Cart",       desc: "Review & checkout" },
    { href: "/customer/orders", icon: "📦", label: "My Orders",     desc: "Track your orders" },
    { href: "/profile",         icon: "👤", label: "Profile",       desc: "Name, phone, EcoCash" },
  ],
  courier: [
    { href: "/courier/jobs",    icon: "🚚", label: "Available Jobs", desc: "Accept deliveries" },
    { href: "/profile",         icon: "👤", label: "Profile",        desc: "Name, phone, EcoCash" },
  ],
};

const ROLE_COLORS: Record<UserRole, string> = {
  customer: "bg-green-100 text-green-800 border-green-200",
  seller:   "bg-amber-100 text-amber-800 border-amber-200",
  courier:  "bg-blue-100 text-blue-800 border-blue-200",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/sign-in");

  const role = profile.role as UserRole;
  const firstName = profile.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-500 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{firstName} 👋</h1>
        </div>
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border capitalize ${ROLE_COLORS[role]}`}>
          {role}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ROLE_LINKS[role].map((link) => (
          <Link key={link.href} href={link.href}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-xl group-hover:bg-blue-600 group-hover:scale-110 transition-all">
              {link.icon}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{link.label}</p>
              <p className="text-slate-500 text-xs">{link.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
