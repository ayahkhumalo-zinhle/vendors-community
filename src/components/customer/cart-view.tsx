"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/customer/cart-provider";
import { placeOrder } from "@/app/(dashboard)/customer/cart/actions";
import { formatUSD } from "@/lib/format";
import type { ActionState } from "@/types";

const PAYMENT_METHODS = [
  { id: "ecocash", label: "EcoCash", icon: "📱", desc: "Econet mobile money" },
  { id: "zipit", label: "ZiP-IT", icon: "🏦", desc: "ZB Bank mobile money" },
  { id: "card", label: "Visa / Card", icon: "💳", desc: "Credit or debit card" },
] as const;

export function CartView() {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, null as ActionState);
  const [payMethod, setPayMethod] = useState<"ecocash" | "zipit" | "card">("ecocash");

  if (!items.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
        <p className="text-2xl">🛒</p>
        <p className="text-slate-500 text-sm">Your cart is empty.</p>
        <Link href="/customer/stores" className="text-blue-600 font-medium text-sm hover:underline">
          Browse stores →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}

      {/* Cart items */}
      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-800 truncate">{item.product_name}</p>
              <p className="text-slate-500 text-sm">{formatUSD(item.price)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold">−</button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                className="w-7 h-7 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center text-sm font-bold">+</button>
              <button onClick={() => removeItem(item.product_id)}
                className="text-red-400 hover:text-red-600 ml-1 text-sm">✕</button>
            </div>
            <span className="text-slate-900 font-semibold w-16 text-right">{formatUSD(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between items-center px-5 py-4 bg-slate-50 rounded-b-2xl">
          <span className="font-semibold text-slate-800">Total</span>
          <span className="font-bold text-slate-900 text-lg">{formatUSD(total)}</span>
        </div>
      </div>

      {/* Checkout form */}
      <form action={formAction} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <input type="hidden" name="items" value={JSON.stringify(items)} />
        <input type="hidden" name="payment_method" value={payMethod} />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            Delivery address <span className="text-red-400">*</span>
          </label>
          <textarea name="delivery_address" rows={2} required
            placeholder="e.g. 14 Greenwood Drive, Borrowdale, Harare"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" disabled={pending} />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Order notes (optional)</label>
          <input name="notes" type="text" placeholder="Any special instructions"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
        </div>

        {/* Payment method */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Payment method</p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => setPayMethod(m.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all ${
                  payMethod === m.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}>
                <span className="text-xl">{m.icon}</span>
                <span className="text-xs font-semibold text-slate-800">{m.label}</span>
                <span className="text-[10px] text-slate-500">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone for mobile money */}
        {(payMethod === "ecocash" || payMethod === "zipit") && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              {payMethod === "ecocash" ? "EcoCash" : "ZiP-IT"} number <span className="text-red-400">*</span>
            </label>
            <input name="phone" type="tel" required placeholder="e.g. 0771 234 567"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
            <p className="text-xs text-slate-500">You will receive a USSD prompt to complete payment.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={pending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
            {pending ? "Processing…" : `Pay ${formatUSD(total)} via ${PAYMENT_METHODS.find(m => m.id === payMethod)?.label}`}
          </button>
          <button type="button" onClick={clearCart}
            className="px-4 py-2.5 text-slate-500 hover:text-red-600 text-sm rounded-lg border border-slate-200 hover:border-red-200 transition-colors">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
