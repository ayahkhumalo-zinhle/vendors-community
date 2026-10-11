import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

interface Props {
  searchParams: Promise<{ message?: string }>;
}

export default async function SignInPage({ searchParams }: Props) {
  const { message } = await searchParams;

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Welcome back
      </h2>
      <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

      {message && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      <SignInForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-blue-600 font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
