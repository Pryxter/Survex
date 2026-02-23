import Link from "next/link";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">Privacy Policy</h1>
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
            <h2 className="mb-2 text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              We collect information that you provide during account creation and survey
              participation, including your name, email, profile details, and reward
              activity.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">2. How We Use Your Information</h2>
            <p>
              We use your data to manage your account, match you with surveys, prevent
              fraud, process rewards, and improve our services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">3. Data Sharing</h2>
            <p>
              We may share limited information with trusted partners that provide survey
              opportunities, fraud prevention, payment processing, and technical support.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">4. Data Security</h2>
            <p>
              We apply reasonable technical and organizational safeguards to protect your
              information. No online system can be guaranteed to be 100% secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">5. Your Choices</h2>
            <p>
              You may request updates or deletion of your account information according to
              applicable law and platform rules.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">6. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact the website
              administrator through your official support channel.
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
