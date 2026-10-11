"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_CONFIG } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

interface Props {
  orderId: string;
  currentStatus: OrderStatus;
  courierId: string;
  isAvailable?: boolean;
}

export function CourierJobActions({ orderId, currentStatus, courierId, isAvailable }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const acceptJob = () => {
    startTransition(async () => {
      await fetch("/api/orders/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, courierId }),
      });
      router.refresh();
    });
  };

  const advance = () => {
    const config = ORDER_STATUS_CONFIG[currentStatus];
    if (!config.next) return;
    startTransition(async () => {
      await fetch("/api/orders/advance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, nextStatus: config.next }),
      });
      router.refresh();
    });
  };

  if (isAvailable) {
    return (
      <button onClick={acceptJob} disabled={pending}
        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
        {pending ? "Accepting…" : "Accept job"}
      </button>
    );
  }

  const config = ORDER_STATUS_CONFIG[currentStatus];
  if (!config.next) return <p className="text-xs text-slate-400">No further action needed.</p>;

  return (
    <button onClick={advance} disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
      {pending ? "Updating…" : `Mark: ${ORDER_STATUS_CONFIG[config.next!].label}`}
    </button>
  );
}
