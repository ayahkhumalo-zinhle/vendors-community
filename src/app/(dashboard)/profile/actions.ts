"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types";

export async function updateProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const full_name = (formData.get("full_name") as string).trim();
  const phone = (formData.get("phone") as string).trim() || null;
  const ecocash_number =
    (formData.get("ecocash_number") as string).trim() || null;

  if (!full_name) {
    return { error: "Full name is required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, ecocash_number })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/profile");
  return { success: "Profile updated." };
}
