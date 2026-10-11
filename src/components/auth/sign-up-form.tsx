"use client";

import { useActionState, useState } from "react";
import { signUp } from "@/app/(auth)/sign-up/actions";
import type { ActionState, UserRole } from "@/types";

const initialState: ActionState = null;

const ROLES: {
  value: UserRole;
  label: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "customer",
    label: "Customer",
    icon: "🛍️",
    description: "Order products and track deliveries",
  },
  {
    value: "seller",
    label: "Seller",
    icon: "🏪",
    description: "List products and manage your store",
  },
  {
    value: "courier",
    label: "Courier",
    icon: "🚚",
    description: "Deliver orders and earn on your schedule",
  },
];

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {state.error}
        </div>
      )}

      {/* Role selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">I am a…</p>
        <div className="grid grid-cols-3 gap-2">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                selectedRole === role.value
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{role.icon}</span>
              <span
                className={`text-xs font-semibold ${
                  selectedRole === role.value
                    ? "text-blue-700"
                    : "text-gray-700"
                }`}
              >
                {role.label}
              </span>
              <span
                className={`text-[10px] leading-tight ${
                  selectedRole === role.value
                    ? "text-blue-500"
                    : "text-gray-400"
                }`}
              >
                {role.description}
              </span>
            </button>
          ))}
        </div>
        {/* Hidden input so the role value is submitted with the form */}
        <input type="hidden" name="role" value={selectedRole} />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700"
        >
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Tendai Moyo"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          disabled={pending}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
          <span className="text-gray-400 font-normal ml-1">(min 6 chars)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Choose a strong password"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          disabled={pending}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
