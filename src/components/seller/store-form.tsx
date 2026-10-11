"use client";

import { useActionState } from "react";
import { saveStore } from "@/app/(dashboard)/seller/store/actions";
import type { ActionState, Seller } from "@/types";

const BUSINESS_TYPES = ["restaurant", "grocery", "pharmacy", "electronics", "clothing", "general"];
const CITIES = ["Harare", "Bulawayo", "Mutare", "Gweru", "Kwekwe", "Kadoma", "Masvingo", "Chinhoyi", "Other"];

export function StoreForm({ defaultValues }: { defaultValues: Seller | null }) {
  const [state, formAction, pending] = useActionState(saveStore, null as ActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">{state.success}</div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Business name <span className="text-red-400">*</span></label>
        <input name="business_name" type="text" required defaultValue={defaultValues?.business_name ?? ""}
          placeholder="e.g. Mama Tendai's Kitchen"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Business type <span className="text-red-400">*</span></label>
        <select name="business_type" required defaultValue={defaultValues?.business_type ?? "general"}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={pending}>
          {BUSINESS_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">City <span className="text-red-400">*</span></label>
          <select name="city" required defaultValue={defaultValues?.city ?? "Harare"}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={pending}>
            {CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Address / area</label>
          <input name="address" type="text" defaultValue={defaultValues?.address ?? ""}
            placeholder="e.g. Avondale, Shop 4"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
        </div>
      </div>

      <button type="submit" disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm">
        {pending ? "Saving…" : defaultValues ? "Save changes" : "Create store"}
      </button>
    </form>
  );
}
