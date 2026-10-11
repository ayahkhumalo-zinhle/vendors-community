import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
        Create your account
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose how you want to use Vendorz
      </p>

      <SignUpForm />

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
