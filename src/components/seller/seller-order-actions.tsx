"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_CONFIG } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
}

export function SellerOrderActions({ orderId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const config = ORDER_STATUS_CONFIG[currentStatus];

  if (!config.next || currentStatus === "cancelled") return null;

  const advance = () => {
    startTransition(async () => {
      await fetch("/api/orders/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, nextStatus: config.next }),
      });
      router.refresh();
    });
  };

  const cancel = () => {
    startTransition(async () => {
      await fetch("/api/orders/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, nextStatus: "cancelled" }),
      });
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
      <button onClick={advance} disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
        {pending ? "Updating…" : `Mark as ${ORDER_STATUS_CONFIG[config.next!].label}`}
      </button>
      {(currentStatus === "received" || currentStatus === "confirmed") && (
        <button onClick={cancel} disabled={pending}
          className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1.5">
          Cancel order
        </button>
      )}
    </div>
  );
}
