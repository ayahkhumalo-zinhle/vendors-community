"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(auth)/sign-in/actions";
import { useCart } from "@/components/customer/cart-provider";
import type { Profile, UserRole } from "@/types";
interface TopNavProps {
  profile: Profile | null;
}

const ROLE_COLORS: Record<UserRole, string> = {
  customer: "bg-green-100 text-green-700",
  seller: "bg-amber-100 text-amber-700",
  courier: "bg-blue-100 text-blue-700",
};

const NAV_LINKS: Record<UserRole, { href: string; label: string }[]> = {
  seller: [
    { href: "/dashboard", label: "Home" },
    { href: "/seller/store", label: "My Store" },
    { href: "/seller/products", label: "Products" },
    { href: "/seller/orders", label: "Orders" },
    { href: "/profile", label: "Profile" },
  ],
  customer: [
    { href: "/dashboard", label: "Home" },
    { href: "/customer/stores", label: "Browse" },
    { href: "/customer/orders", label: "My Orders" },
    { href: "/profile", label: "Profile" },
  ],
  courier: [
    { href: "/dashboard", label: "Home" },
    { href: "/courier/jobs", label: "Jobs" },
    { href: "/profile", label: "Profile" },
  ],
};

function CartBadge() {
  const { count } = useCart();
  if (count === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function TopNav({ profile }: TopNavProps) {
  const pathname = usePathname();
  const role = (profile?.role ?? "customer") as UserRole;
  const navLinks = NAV_LINKS[role];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-2 shrink-0"
        >
          <span className="text-blue-600">Vendor</span>z
        </Link>

        <nav className="hidden sm:flex items-center gap-1 overflow-x-auto">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === link.href
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          {role === "customer" && (
            <Link href="/customer/cart" className="relative p-2 text-slate-600 hover:text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <CartBadge />
            </Link>
          )}
          {profile && (
            <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[role]}`}>
              {role}
            </span>
          )}
          <form action={signOut}>
            <button type="submit" className="text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
