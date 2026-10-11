"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(dashboard)/profile/actions";
import type { ActionState } from "@/types";

interface ProfileFormProps {
  defaultValues: {
    full_name: string;
    phone: string;
    ecocash_number: string;
  };
}

const initialState: ActionState = null;

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
          {state.success}
        </div>
      )}

      <div className="space-y-1">
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-slate-700"
        >
          Full name <span className="text-red-400">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          defaultValue={defaultValues.full_name}
          placeholder="Tendai Moyo"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-slate-700"
        >
          Phone number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultValues.phone}
          placeholder="+263 77 123 4567"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="ecocash_number"
          className="block text-sm font-medium text-slate-700"
        >
          EcoCash number
          <span className="text-slate-400 font-normal ml-1">
            (for payments)
          </span>
        </label>
        <input
          id="ecocash_number"
          name="ecocash_number"
          type="tel"
          defaultValue={defaultValues.ecocash_number}
          placeholder="077 123 4567"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-colors text-sm"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
