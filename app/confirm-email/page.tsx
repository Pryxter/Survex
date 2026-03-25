import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmEmailClient from "./confirm-email-client";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Confirm Email",
};

export default function ConfirmEmailPage() {
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
            <section className="rounded-3xl border border-cyan-300/30 bg-white/[0.04] p-6 shadow-2xl backdrop-blur md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                One Last Step
              </p>
              <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                Confirm your email to activate your account
              </h1>
              <p className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                Loading confirmation details...
              </p>
            </section>
          }
        >
          <ConfirmEmailClient />
        </Suspense>
      </main>
      <div className="mx-auto w-full max-w-2xl">
        <SiteFooter />
      </div>
    </div>
  );
}
