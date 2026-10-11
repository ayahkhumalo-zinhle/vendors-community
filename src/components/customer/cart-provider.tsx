"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: string) => void;
  updateQty: (product_id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "vendorz_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const save = (next: CartItem[]) => {
    setItems(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Different seller — clear cart first
      if (prev.length > 0 && prev[0].seller_id !== item.seller_id) {
        const next = [{ ...item, quantity: 1 }];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      }
      const existing = prev.find((i) => i.product_id === item.product_id);
      const next = existing
        ? prev.map((i) =>
            i.product_id === item.product_id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { ...item, quantity: 1 }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeItem = useCallback((product_id: string) => {
    save(items.filter((i) => i.product_id !== product_id));
  }, [items]);

  const updateQty = useCallback((product_id: string, qty: number) => {
    if (qty < 1) {
      save(items.filter((i) => i.product_id !== product_id));
    } else {
      save(items.map((i) => i.product_id === product_id ? { ...i, quantity: qty } : i));
    }
  }, [items]);

  const clearCart = useCallback(() => {
    save([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
