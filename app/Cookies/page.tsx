import Link from "next/link";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies Policy",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 md:px-10">
      <main className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold md:text-4xl">Cookies Policy</h1>
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
            <h2 className="mb-2 text-lg font-bold text-white">1. What Are Cookies</h2>
            <p>
              Cookies are small text files stored on your device to help websites
              function, remember preferences, and improve user experience.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">2. How We Use Cookies</h2>
            <p>
              We use cookies to keep you signed in, protect account security, remember
              settings, and measure performance of pages and features.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">3. Third-Party Cookies</h2>
            <p>
              Some integrations may use third-party cookies for survey delivery, fraud
              prevention, analytics, or abuse detection.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">4. Managing Cookies</h2>
            <p>
              You can control cookies in your browser settings. Disabling cookies may
              affect features like login, survey access, and reward tracking.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">5. Policy Updates</h2>
            <p>
              We may update this Cookies Policy from time to time. Continued use of the
              website means you accept the updated policy.
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
