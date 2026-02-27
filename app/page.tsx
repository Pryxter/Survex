import Link from "next/link";
import SiteFooter from "./components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

const steps = [
  {
    title: "Create your free account",
    description:
      "Tell us your country and interests so we can send relevant surveys to your inbox.",
  },
  {
    title: "Answer paid surveys",
    description:
      "Complete fast surveys from trusted brands and collect points for each valid response.",
  },
  {
    title: "Redeem rewards",
    description:
      "Convert your points into PayPal cash or popular gift cards as soon as you reach the threshold.",
  },
];

const perks = [
  "Available in multiple countries and languages",
  "Simple surveys designed for mobile and desktop",
  "Secure payouts and transparent reward system",
  "Friendly support team that answers quickly",
];

const faqs = [
  {
    question: "How much can I earn?",
    answer:
      "Earnings depend on your profile and survey availability in your country. Most users redeem small but frequent rewards.",
  },
  {
    question: "How do I get paid?",
    answer:
      "Once you reach the minimum points, you can request PayPal cash or gift cards from available partners.",
  },
  {
    question: "How often will I receive surveys?",
    answer:
      "Surveys and offers are available directly through our Offer Wall. Availability depends on active campaigns and how well your profile matches advertiser requirements. New opportunities may appear at any time, so we recommend checking the Offer Wall regularly.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-400/20 blur-3xl" />
        </div>

        <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-10 md:pb-28">
          <nav className="mb-14 flex items-center justify-between">
            <p className="text-xl font-black tracking-tight">
              SURVEX<span className="text-cyan-300">.app</span>
            </p>
            <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
              <a href="#how-it-works" className="hover:text-white">
                How it Works
              </a>
              <a href="#rewards" className="hover:text-white">
                Rewards
              </a>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white hover:border-white"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-cyan-200"
              >
                Join Free
              </Link>
            </div>
          </nav>

          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-cyan-200">
                Paid Online Surveys
              </p>
              <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
                Share your opinion.
                <br />
                Earn real rewards.
              </h1>
              <p className="mt-6 max-w-xl text-base text-slate-300 md:text-lg">
                Join a global survey community and get rewarded for quick,
                secure, and easy surveys from home.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/signup"
                  className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200"
                >
                  Sign Up Today
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-full border border-white/25 px-6 py-3 text-sm font-bold hover:border-white"
                >
                  Learn More
                </a>
              </div>
              <div className="mt-10 grid grid-cols-1 gap-4 text-left">
                <div>
                  <p className="text-2xl font-extrabold text-cyan-300">
                    Surveys available worldwide.
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Trusted survey partners • Secure payouts • U.S. focused
                  </p>
                </div>
                {/* <div>
                  <p className="text-2xl font-extrabold text-cyan-300">70+</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Countries
                  </p>
                </div> */}
                {/* <div>
                  <p className="text-2xl font-extrabold text-cyan-300">$1M+</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Rewards Sent
                  </p>
                </div> */}
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur">
              <p className="mb-4 text-sm font-semibold text-cyan-200">
                Popular Rewards
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["Amazon", "PayPal", "Visa", "Bank"].map((reward) => (
                  <div
                    key={reward}
                    className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-6 text-center text-sm font-semibold"
                  >
                    {reward}
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-300">
                Complete surveys, collect points, and redeem your rewards
                safely.
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="bg-white text-slate-900">
          <div className="mx-auto max-w-6xl px-6 py-18 md:px-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
              How It Works
            </p>
            <h2 className="max-w-2xl text-3xl font-extrabold md:text-4xl">
              Start in minutes and turn your time into rewards
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <p className="mb-4 text-sm font-black text-cyan-700">
                    0{index + 1}
                  </p>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 text-slate-600">{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="rewards" className="mx-auto max-w-6xl px-6 py-18 md:px-10">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Why People Join
              </p>
              <h2 className="text-3xl font-extrabold md:text-4xl">
                Reliable surveys, transparent payouts, global community
              </h2>
              <p className="mt-5 text-slate-300">
                We partner with research companies that value real opinions.
                Every completed survey brings you closer to your next reward.
              </p>
              <ul className="mt-8 space-y-3">
                {perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-3 text-slate-200"
                  >
                    <span className="mt-1 text-cyan-300">*</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* <div className="rounded-3xl border border-white/15 bg-white/5 p-6">
              <p className="text-sm font-semibold text-cyan-200">
                Community Feedback
              </p>
              <div className="mt-5 space-y-4">
                {testimonials.map((item) => (
                  <blockquote
                    key={item.name}
                    className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"
                  >
                    <p className="text-sm text-slate-200">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="mt-3 text-xs text-slate-400">
                      {item.name} - {item.location}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div> */}
          </div>
        </section>

        <section id="faq" className="bg-slate-900/70">
          <div className="mx-auto max-w-4xl px-6 py-18 md:px-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              FAQ
            </p>
            <h2 className="text-3xl font-extrabold md:text-4xl">
              Everything you need to know before joining
            </h2>
            <div className="mt-8 space-y-4">
              {faqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <h3 className="text-lg font-bold">{faq.question}</h3>
                  <p className="mt-2 text-slate-300">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="mx-auto max-w-6xl px-6 py-20 md:px-10">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-300 to-emerald-300 p-8 text-slate-900 md:p-12">
            <h2 className="max-w-2xl text-3xl font-black leading-tight md:text-5xl">
              Join SURVEX today and start earning with your opinion.
            </h2>
            <p className="mt-4 max-w-2xl text-base md:text-lg">
              Registration is free. It only takes a moment to create your
              profile and receive your first survey invitation.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-full bg-slate-900 px-7 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>
      <div className="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10">
        <SiteFooter className="mt-0" />
      </div>
    </div>
  );
}
