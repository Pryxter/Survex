import DashboardNavbar from "../components/dashboard-navbar";
import Image from "next/image";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

const surveyWalls = [
  {
    name: "BitLabs",
    image: "/survey-walls/cpx-research.svg",
    alt: "BitLabs visual",
  },
  {
    name: "TheoremReach",
    image: "/survey-walls/theoremreach.svg",
    alt: "TheoremReach visual",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="earn" />

        <section
          className="neon-shift mt-8 rounded-3xl p-[1px]"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #67e8f9, #38bdf8, #f43f5e, #67e8f9)",
            backgroundSize: "250% 250%",
          }}
        >
          <div className="rounded-[calc(1.5rem-1px)] bg-slate-900/90 p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
              Survey Walls
            </p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Start earning with premium partners
            </h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Choose a survey wall and complete available offers to increase
              your balance.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {surveyWalls.map((wall) => (
                wall.name === "TheoremReach" || wall.name === "BitLabs" ? (
                  <Link
                    key={wall.name}
                    href={wall.name === "BitLabs" ? "/BitLabs" : "/TheoremReach"}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/60"
                  >
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-800/70">
                      <Image
                        src={wall.image}
                        alt={wall.alt}
                        width={640}
                        height={360}
                        className="h-28 w-full object-cover"
                      />
                    </div>
                    <p className="mt-3 text-center text-base font-bold">
                      {wall.name}
                    </p>
                  </Link>
                ) : (
                  <article
                    key={wall.name}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-800/70">
                      <Image
                        src={wall.image}
                        alt={wall.alt}
                        width={640}
                        height={360}
                        className="h-28 w-full object-cover"
                      />
                    </div>
                    <p className="mt-3 text-center text-base font-bold">
                      {wall.name}
                    </p>
                  </article>
                )
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Mobile Game Offers
          </p>
          <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
            Complete game tasks and earn rewards
          </h2>
          <div className="mt-5 rounded-2xl border border-dashed border-cyan-300/40 bg-cyan-400/5 px-5 py-8 text-center">
            <p className="text-2xl font-black tracking-wide text-cyan-200">
              Coming Soon
            </p>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
