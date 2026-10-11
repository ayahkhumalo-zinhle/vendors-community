import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/profile-form";
import type { UserRole } from "@/types";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  seller: "Seller",
  courier: "Courier",
};

const ROLE_COLORS: Record<UserRole, string> = {
  customer: "bg-green-100 text-green-800 border-green-200",
  seller: "bg-amber-100 text-amber-800 border-amber-200",
  courier: "bg-blue-100 text-blue-800 border-blue-200",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/sign-in");

  const role = profile.role as UserRole;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Account info card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          {/* Avatar placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl font-semibold text-blue-600">
            {profile.full_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-lg">
              {profile.full_name}
            </p>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-slate-500 text-sm">Account type</span>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}
          >
            {ROLE_LABELS[role]}
          </span>
          <span className="text-slate-400 text-xs ml-1">
            (contact support to change)
          </span>
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold text-slate-800 mb-4">Edit details</h2>
        <ProfileForm
          defaultValues={{
            full_name: profile.full_name,
            phone: profile.phone ?? "",
            ecocash_number: profile.ecocash_number ?? "",
          }}
        />
      </div>
    </div>
  );
}
