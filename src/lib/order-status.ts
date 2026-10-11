import type { OrderStatus } from "@/types";

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; next?: OrderStatus }
> = {
  received:           { label: "Order Received",      color: "bg-blue-100 text-blue-800",     next: "confirmed" },
  confirmed:          { label: "Seller Confirmed",     color: "bg-indigo-100 text-indigo-800", next: "preparing" },
  preparing:          { label: "Preparing",            color: "bg-yellow-100 text-yellow-800", next: "courier_assigned" },
  courier_assigned:   { label: "Courier Assigned",     color: "bg-orange-100 text-orange-800", next: "courier_travelling" },
  courier_travelling: { label: "Courier Travelling",   color: "bg-orange-100 text-orange-800", next: "collected" },
  collected:          { label: "Order Collected",      color: "bg-purple-100 text-purple-800", next: "in_transit" },
  in_transit:         { label: "In Transit",           color: "bg-purple-100 text-purple-800", next: "approaching" },
  approaching:        { label: "Approaching",          color: "bg-teal-100 text-teal-800",     next: "delivered" },
  delivered:          { label: "Delivered",            color: "bg-green-100 text-green-800",   next: "completed" },
  completed:          { label: "Completed",            color: "bg-green-200 text-green-900" },
  cancelled:          { label: "Cancelled",            color: "bg-red-100 text-red-800" },
};
