import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Gifts",
};

const giftMethods = [
  "Amazon Gift Card",
  "PayPal Cash",
  "Visa Prepaid",
  "Bank Transfer",
  "DoorDash",
  "Domino's",
  "Google Play",
  "Uber",
  "Home Depot",
  "Best Buy",
  "Walmart",
];

export default function GiftsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10">
        <nav className="mb-10 flex items-center justify-between">
          <Link href="/" className="cursor-pointer text-xl font-black tracking-tight">
            SURV<span className="brand-breathe text-cyan-300">EX</span>
          </Link>
          <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/gifts" className="text-cyan-200">
              Rewards
            </Link>
            <Link href="/faq" className="hover:text-white">
              FAQ
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
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

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Rewards
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Gift Methods Available on Survex
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Redeem your balance through cash and popular gift card options. More
            payout partners may be added over time.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {giftMethods.map((method) => (
              <article
                key={method}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
              >
                <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-800/70">
                  <Image
                    src={`/rewards/${method}.png`}
                    alt={`${method} reward`}
                    width={640}
                    height={360}
                    className="h-24 w-full object-cover"
                  />
                </div>
                <p className="mt-3 text-center text-base font-bold">{method}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-cyan-300 to-emerald-300 p-8 text-center text-slate-900 md:p-10">
          <h2 className="text-2xl font-black md:text-3xl">
            Create your account and start earning today
          </h2>
          <p className="mt-3 text-sm font-semibold md:text-base">
            Sign up for free and unlock survey rewards in minutes.
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-8 py-3 text-sm font-black text-white hover:bg-slate-800"
          >
            Go to Sign Up
          </Link>
        </section>
      </main>

      <div className="mx-auto w-full max-w-6xl px-6 pb-8 md:px-10">
        <SiteFooter className="mt-0" />
      </div>
    </div>
  );
}

