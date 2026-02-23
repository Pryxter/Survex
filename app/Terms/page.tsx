import Link from "next/link";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">Terms and Conditions</h1>
          <Link
            href="/signup"
            className="rounded-full border border-cyan-300/50 px-4 py-2 text-sm font-semibold text-cyan-300 hover:bg-cyan-300/10"
          >
            Back to Sign Up
          </Link>
        </div>

        <p className="text-sm text-slate-300">Effective date: February 22, 2026</p>

        <div className="mt-6 space-y-5 text-sm leading-relaxed text-slate-200">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using this website, you agree to these Terms and
              Conditions and all applicable laws.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">2. Account Eligibility</h2>
            <p>
              You must provide accurate information and maintain only one account per
              person/device unless explicitly authorized.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">3. Survey Participation</h2>
            <p>
              You agree to provide honest answers. Fraud, duplicate activity, VPN/proxy
              abuse, or manipulation may result in suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">4. Rewards and Balance</h2>
            <p>
              Reward amounts, availability, and redemption options may change at any time.
              We may delay or reverse rewards if suspicious or invalid activity is detected.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">5. Limitation of Liability</h2>
            <p>
              This service is provided on an &quot;as is&quot; basis. We are not liable for indirect,
              incidental, or consequential damages to the extent allowed by law.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">6. Changes to Terms</h2>
            <p>
              We may update these Terms and Conditions at any time. Continued use of the
              website after updates means you accept the revised terms.
            </p>
          </section>
        </div>
      </main>
      <div className="mx-auto w-full max-w-3xl">
        <SiteFooter />
      </div>
    </div>
  );
}
