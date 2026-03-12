import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./verify-email-client";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Verify Email",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-2xl">
        <Link
          href="/login"
          className="mb-8 inline-block text-sm font-semibold text-cyan-300 hover:text-cyan-200"
        >
          Back to Login
        </Link>

        <Suspense
          fallback={
            <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
              <h1 className="text-3xl font-extrabold md:text-4xl">
                Email Verification
              </h1>
              <p className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                Validating your verification link...
              </p>
            </section>
          }
        >
          <VerifyEmailClient />
        </Suspense>
      </main>
      <div className="mx-auto w-full max-w-2xl">
        <SiteFooter />
      </div>
    </div>
  );
}
