import Link from "next/link";
import type { Metadata } from "next";
import SiteFooter from "../components/site-footer";

export const metadata: Metadata = {
  title: "Blog",
};

const articles = [
  {
    id: "best-survey-site-2026",
    title: "Best survey site in 2026",
    summary:
      "The best survey platform in 2026 is not only about high payouts. It is about consistency, trust, and transparency. Survex focuses on all three so users can earn with confidence.",
    points: [
      "Provider quality matters. Survex connects users with established survey partners and applies quality checks to reduce fraud and improve campaign reliability.",
      "Clear account status is essential. Email verification, anti-multi-account controls, and basic VPN/proxy protection help protect honest users and keep rewards fair.",
      "Support and payout visibility make the difference. With profile history, withdrawal tracking, and support ticket flow, users can understand what happened and what comes next.",
    ],
  },
  {
    id: "how-to-earn-gift-cards-online",
    title: "How to earn gift cards online",
    summary:
      "Earning gift cards online is simple when you follow a clean process: register, complete surveys honestly, and redeem only after your balance is available.",
    points: [
      "Create your account with complete profile details. Better profile quality improves matching and helps unlock more relevant surveys.",
      "Complete surveys from available walls (for example TheoremReach and CPX Research) directly from the dashboard and follow instructions carefully.",
      "Avoid rushed or inconsistent answers. Quality checks by providers can disqualify or reverse rewards if behavior looks invalid.",
      "When your balance reaches the redemption thresholds, request your reward and monitor status in your profile history.",
    ],
  },
  {
    id: "why-surveys-disqualify-users",
    title: "Why surveys disqualify users",
    summary:
      "Disqualification is a normal part of survey platforms. Most campaigns target very specific audiences, so not every user will match every questionnaire.",
    points: [
      "Target criteria mismatch. A campaign may need people from a specific age range, location, profession, or buying behavior.",
      "Quota filled. Even if you match, survey slots can close quickly once enough valid responses are collected.",
      "Quality and consistency checks. Contradictory answers, extremely fast completion, or suspicious activity may trigger disqualification or reversals.",
      "Technical context. Device restrictions, geo restrictions, or ad-block/network issues can also break eligibility flows.",
    ],
  },
];

export default function BlogPage() {
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
            Blog
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Survex Guides and Insights
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Learn how to earn rewards more effectively, understand survey
            qualification logic, and see how payout workflows work on Survex.
          </p>

          <div className="mt-8 space-y-4">
            {articles.map((article) => (
              <article
                id={article.id}
                key={article.id}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-5"
              >
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <p className="mt-3 text-slate-300">{article.summary}</p>
                <ul className="mt-4 space-y-2 text-slate-200">
                  {article.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-1 text-cyan-300">*</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-10 py-4 text-lg font-extrabold text-slate-950 transition hover:bg-cyan-200"
            >
              Join Survex and Start Earning Today
            </Link>
          </div>
        </section>
      </main>

      <div className="mx-auto w-full max-w-5xl px-6 pb-8 md:px-10">
        <SiteFooter className="mt-0" />
      </div>
    </div>
  );
}
