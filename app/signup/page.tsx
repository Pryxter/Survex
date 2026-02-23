import Link from "next/link";
import AuthForm from "../components/auth-form";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Back to Home
        </Link>

        <AuthForm
          mode="signup"
          title="Sign Up"
          subtitle="Create your account and start receiving paid survey invitations."
          submitLabel="Create Account"
        />
      </main>
      <div className="mx-auto w-full max-w-2xl">
        <SiteFooter />
      </div>
    </div>
  );
}
