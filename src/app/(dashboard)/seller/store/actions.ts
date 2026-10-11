"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types";

export async function saveStore(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const business_name = (formData.get("business_name") as string).trim();
  const business_type = (formData.get("business_type") as string).trim();
  const city = (formData.get("city") as string).trim();
  const address = (formData.get("address") as string).trim() || null;

  if (!business_name || !city) return { error: "Business name and city are required." };

  const { data: existing } = await supabase
    .from("sellers").select("id").eq("user_id", user.id).single();

  if (existing) {
    const { error } = await supabase
      .from("sellers")
      .update({ business_name, business_type, city, address })
      .eq("user_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("sellers")
      .insert({ user_id: user.id, business_name, business_type, city, address });
    if (error) return { error: error.message };
  }

  revalidatePath("/seller/store");
  return { success: "Store saved." };
}

export async function toggleStoreOpen(isOpen: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("sellers").update({ is_open: isOpen }).eq("user_id", user.id);
  revalidatePath("/seller/store");
}
