import { ORDER_STATUS_CONFIG } from "@/lib/order-status";
import type { OrderStatus } from "@/types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
