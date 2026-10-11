"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState, UserRole } from "@/types";

export async function signUp(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const role = formData.get("role") as UserRole;

  if (!["customer", "seller", "courier"].includes(role)) {
    return { error: "Please select a valid role." };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: {
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect(
    "/sign-in?message=Account created! Check your email to verify, then sign in."
  );
}
