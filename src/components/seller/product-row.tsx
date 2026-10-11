"use client";

import Link from "next/link";
import { deleteProduct } from "@/app/(dashboard)/seller/products/actions";
import type { Product } from "@/types";

interface ProductRowProps {
  product: Product;
  formatUSD: (n: number) => string;
}

export function ProductRow({ product, formatUSD }: ProductRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-800 truncate">{product.name}</p>
          {!product.is_available && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Hidden</span>
          )}
        </div>
        <p className="text-slate-500 text-xs mt-0.5 capitalize">{product.category} · Stock: {product.stock_qty}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-900">{formatUSD(product.price)}</span>
        <Link href={`/seller/products/${product.id}/edit`}
          className="text-xs text-blue-600 hover:underline font-medium">Edit</Link>
        <form action={deleteProduct.bind(null, product.id)}>
          <button type="submit"
            className="text-xs text-red-500 hover:text-red-700 font-medium"
            onClick={(e) => { if (!confirm("Delete this product?")) e.preventDefault(); }}>
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
