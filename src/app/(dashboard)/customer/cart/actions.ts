"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPaynowClient } from "@/lib/paynow";
import type { CartItem, ActionState } from "@/types";
import type { PaymentMethod } from "@/lib/paynow";

export async function placeOrder(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const delivery_address = (formData.get("delivery_address") as string).trim();
  const notes = (formData.get("notes") as string).trim() || null;
  const itemsJson = formData.get("items") as string;
  const payment_method = (formData.get("payment_method") as PaymentMethod) ?? "card";
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!delivery_address) return { error: "Delivery address is required." };
  if ((payment_method === "ecocash" || payment_method === "zipit") && !phone) {
    return { error: "Phone number required for mobile money payment." };
  }

  let items: CartItem[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid cart data." };
  }
  if (!items.length) return { error: "Your cart is empty." };

  const seller_id = items[0].seller_id;
  const total_amount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      seller_id,
      total_amount,
      delivery_address,
      notes,
      payment_method,
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: orderError?.message ?? "Failed to create order." };

  const orderItems = items.map((i) => ({
    order_id: order.id,
    product_id: i.product_id,
    product_name: i.product_name,
    quantity: i.quantity,
    unit_price: i.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) return { error: itemsError.message };

  // Initiate Paynow payment
  try {
    const paynow = createPaynowClient();
    paynow.returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/customer/orders/${order.id}`;

    const payment = paynow.createPayment(order.id, user.email ?? "");
    items.forEach((i) => payment.add(i.product_name, i.price * i.quantity));

    let paynowResponse;
    if (payment_method === "ecocash") {
      paynowResponse = await paynow.sendMobile(payment, phone!, "ecocash");
    } else if (payment_method === "zipit") {
      paynowResponse = await paynow.sendMobile(payment, phone!, "zipit");
    } else {
      paynowResponse = await paynow.send(payment);
    }

    if (paynowResponse.success) {
      await supabase
        .from("orders")
        .update({ paynow_poll_url: paynowResponse.pollUrl })
        .eq("id", order.id);

      if (payment_method === "card" && paynowResponse.redirectUrl) {
        redirect(paynowResponse.redirectUrl);
      }
    }
  } catch {
    // Payment initiation failed — order still exists, user can retry from order page
  }

  redirect(`/customer/orders/${order.id}`);
}
