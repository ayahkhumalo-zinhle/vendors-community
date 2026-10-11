"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types";

async function getSellerOrNull(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("sellers").select("id").eq("user_id", userId).single();
  return data;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSellerOrNull(supabase, user.id);
  if (!seller) return { error: "Set up your store first." };

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string).trim();
  const stock_qty = parseInt(formData.get("stock_qty") as string, 10);

  if (!name || isNaN(price) || price < 0) return { error: "Name and valid price are required." };

  const { error } = await supabase.from("products").insert({
    seller_id: seller.id, name, description, price, category, stock_qty: isNaN(stock_qty) ? 0 : stock_qty,
  });
  if (error) return { error: error.message };

  revalidatePath("/seller/products");
  redirect("/seller/products");
}

export async function updateProduct(
  productId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const seller = await getSellerOrNull(supabase, user.id);
  if (!seller) return { error: "No store found." };

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim() || null;
  const price = parseFloat(formData.get("price") as string);
  const category = (formData.get("category") as string).trim();
  const stock_qty = parseInt(formData.get("stock_qty") as string, 10);
  const is_available = formData.get("is_available") === "true";

  if (!name || isNaN(price) || price < 0) return { error: "Name and valid price are required." };

  const { error } = await supabase.from("products")
    .update({ name, description, price, category, stock_qty: isNaN(stock_qty) ? 0 : stock_qty, is_available })
    .eq("id", productId).eq("seller_id", seller.id);
  if (error) return { error: error.message };

  revalidatePath("/seller/products");
  redirect("/seller/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const seller = await getSellerOrNull(supabase, user.id);
  if (!seller) return;
  await supabase.from("products").delete().eq("id", productId).eq("seller_id", seller.id);
  revalidatePath("/seller/products");
}
