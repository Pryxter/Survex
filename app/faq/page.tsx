import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "FAQ",
};

const faqs = [
  {
    question: "How much can I earn on Survex?",
    answer:
      "Your earnings depend on your profile, country, and campaign availability. Most users redeem small but frequent rewards over time.",
  },
  {
    question: "How do rewards and withdrawals work?",
    answer:
      "You can request rewards when your balance reaches the minimum threshold. Requests are reviewed and usually processed within 3-5 business days.",
  },
  {
    question: "Why can a survey be reversed?",
    answer:
      "A survey can be reversed if the provider detects duplicate, inconsistent, or invalid responses during quality checks.",
  },
  {
    question: "Do I need to verify my email?",
    answer:
      "Yes. Email verification is required before you can access the platform and start earning.",
  },
  {
    question: "I did not receive my email. What should I do?",
    answer:
      "Please check your spam or junk folder first. If it is still missing, use the resend option on the login/signup flow.",
  },
];

export default function FaqPage() {
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
            FAQ
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Quick answers about surveys, rewards, and account access.
          </p>

          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <article
                key={item.question}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
              >
                <h2 className="text-lg font-bold">{item.question}</h2>
                <p className="mt-2 text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-5xl px-6 pb-8 md:px-10">
        <SiteFooter className="mt-0" />
      </div>
    </div>
  );
}
