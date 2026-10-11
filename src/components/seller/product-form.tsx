"use client";

import { useActionState } from "react";
import { createProduct, updateProduct } from "@/app/(dashboard)/seller/products/actions";
import type { ActionState, Product } from "@/types";

const CATEGORIES = ["food", "drinks", "groceries", "pharmacy", "electronics", "clothing", "hardware", "beauty", "general"];

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;

  const [state, formAction, pending] = useActionState(action, null as ActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{state.error}</div>
      )}

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Product name <span className="text-red-400">*</span></label>
        <input name="name" type="text" required defaultValue={product?.name ?? ""}
          placeholder="e.g. Sadza and Chicken"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea name="description" rows={2} defaultValue={product?.description ?? ""}
          placeholder="Brief description of the product"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" disabled={pending} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Price (USD) <span className="text-red-400">*</span></label>
          <input name="price" type="number" required min="0" step="0.01" defaultValue={product?.price ?? ""}
            placeholder="0.00"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">Stock quantity</label>
          <input name="stock_qty" type="number" min="0" defaultValue={product?.stock_qty ?? 0}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={pending} />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-700">Category</label>
        <select name="category" defaultValue={product?.category ?? "general"}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" disabled={pending}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      {product && (
        <div className="flex items-center gap-2">
          <input type="hidden" name="is_available" value={product.is_available ? "true" : "false"} />
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
            <input type="checkbox" defaultChecked={product.is_available}
              onChange={(e) => {
                const hidden = e.currentTarget.parentElement?.querySelector<HTMLInputElement>('input[name="is_available"]');
                if (hidden) hidden.value = e.currentTarget.checked ? "true" : "false";
              }}
              className="w-4 h-4 rounded border-slate-300 text-blue-600" />
            Available for ordering
          </label>
        </div>
      )}

      <button type="submit" disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm">
        {pending ? "Saving…" : product ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
