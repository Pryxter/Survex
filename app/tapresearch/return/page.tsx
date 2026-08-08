import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TapResearch Return",
};

export default function TapResearchReturnPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900/70 p-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
          TapResearch
        </p>
        <h1 className="mt-3 text-3xl font-extrabold">Survey Flow Completed</h1>
        <p className="mt-3 text-sm text-slate-300">
          You can safely close this tab and return to Survex.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-500/15 px-5 py-2.5 text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/25"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
