"use client";

import { useCart } from "@/components/customer/cart-provider";
import type { Product } from "@/types";

interface Props {
  product: Product;
  sellerId: string;
}

export function AddToCartButton({ product, sellerId }: Props) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() =>
        addItem({
          product_id: product.id,
          seller_id: sellerId,
          product_name: product.name,
          price: product.price,
          quantity: 1,
        })
      }
      className="mt-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
    >
      Add
    </button>
  );
}
