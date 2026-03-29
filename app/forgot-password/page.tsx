import Link from "next/link";
import type { Metadata } from "next";
import ForgotPasswordClient from "./forgot-password-client";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Forgot Password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-2xl">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center rounded-full border border-cyan-300/60 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 hover:text-cyan-200"
        >
          Back to Login
        </Link>

        <ForgotPasswordClient />
      </main>
      <div className="mx-auto w-full max-w-2xl">
        <SiteFooter />
      </div>
    </div>
  );
}
