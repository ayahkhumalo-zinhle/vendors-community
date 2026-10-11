export type UserRole = "customer" | "seller" | "courier";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  ecocash_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Seller {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  address: string | null;
  city: string;
  is_open: boolean;
  is_verified: boolean;
  rating: number;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock_qty: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "courier_assigned"
  | "courier_travelling"
  | "collected"
  | "in_transit"
  | "approaching"
  | "delivered"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  customer_id: string;
  seller_id: string;
  courier_id: string | null;
  status: OrderStatus;
  total_amount: number;
  delivery_address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface CartItem {
  product_id: string;
  seller_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

export type ActionState = {
  error?: string;
  success?: string;
} | null;
