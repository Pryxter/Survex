import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xl font-black tracking-tight">
            SURVEX<span className="text-cyan-300">.app</span>
          </p>
          <Link
            href="/"
            className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:border-white"
          >
            Back to Home
          </Link>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Contact
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Contact Survex
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Need help with your account, surveys, rewards, or withdrawals? Our
            support team is here to help.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <p className="text-sm uppercase tracking-wide text-slate-400">
              Support Email
            </p>
            <a
              href="mailto:support@survex.app"
              className="mt-2 inline-block text-lg font-bold text-cyan-300 hover:text-cyan-200"
            >
              support@survex.app
            </a>
            <p className="mt-4 text-slate-300">
              Please include your account email and a short description of your
              issue so we can assist you faster.
            </p>
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-5xl px-6 pb-8 md:px-10">
        <SiteFooter className="mt-0" />
      </div>
    </div>
  );
}
