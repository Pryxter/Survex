"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

const surveyWalls = [
  {
    name: "AdGem",
    image: "/survey-walls/adgem.svg",
    alt: "AdGem visual",
    href: "/adgem",
  },
  {
    name: "TheoremReach",
    image: "/survey-walls/theoremreach.svg",
    alt: "TheoremReach visual",
    href: "/TheoremReach",
  },
  {
    name: "TapResearch",
    image: "/survey-walls/tapresearch.svg",
    alt: "TapResearch visual",
    href: "/tapresearch",
  },
  {
    name: "InBrain.ai",
    image: "/survey-walls/Inbrain.svg",
    alt: "InBrain.ai visual",
    href: "/InBrain",
  },
];

export default function DashboardClient() {
  const router = useRouter();
  const [balanceOverride, setBalanceOverride] = useState("0.00");
  const [showWelcomeBonusModal, setShowWelcomeBonusModal] = useState(false);
  const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(0.5);
  const [isClaimingWelcomeBonus, setIsClaimingWelcomeBonus] = useState(false);
  const [welcomeBonusError, setWelcomeBonusError] = useState("");
  const [welcomeBonusMessage, setWelcomeBonusMessage] = useState("");
  const hasSession =
    typeof window !== "undefined" &&
    Boolean(window.localStorage.getItem("survex_token"));

  useEffect(() => {
    if (!hasSession) {
      router.replace("/login");
      return;
    }

    let isMounted = true;
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const syncUserInStorage = (user: { balance?: string | number }) => {
      const normalizedBalance = Number(user?.balance || 0).toFixed(2);
      setBalanceOverride(normalizedBalance);

      const existingRaw = localStorage.getItem("survex_user");
      if (!existingRaw) {
        return;
      }

      try {
        const existing = JSON.parse(existingRaw) as Record<string, unknown>;
        localStorage.setItem(
          "survex_user",
          JSON.stringify({
            ...existing,
            ...user,
            balance: normalizedBalance,
          }),
        );
      } catch {
        // Ignore local storage parse errors.
      }
    };

    const storedUserRaw = localStorage.getItem("survex_user");
    if (storedUserRaw) {
      try {
        const storedUser = JSON.parse(storedUserRaw) as {
          balance?: string | number;
        };
        syncUserInStorage(storedUser);
      } catch {
        // Ignore local storage parse errors.
      }
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/welcome-bonus/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Unable to load welcome bonus status.");
        }
        return data as {
          showClaimModal?: boolean;
          amount?: string | number;
          message?: string;
          user?: { balance?: string | number };
        };
      })
      .then((data) => {
        if (!isMounted) {
          return;
        }

        if (data.user) {
          syncUserInStorage(data.user);
        }

        const parsedAmount = Number(data.amount || 0.5);
        if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
          setWelcomeBonusAmount(Number(parsedAmount.toFixed(2)));
        }

        if (Boolean(data.showClaimModal)) {
          setShowWelcomeBonusModal(true);
        }
      })
      .catch(() => {
        // Keep dashboard usable even if bonus status request fails.
      });

    return () => {
      isMounted = false;
    };
  }, [hasSession, router]);

  async function handleClaimWelcomeBonus() {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      setIsClaimingWelcomeBonus(true);
      setWelcomeBonusError("");
      setWelcomeBonusMessage("");

      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/welcome-bonus/claim`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response.json()) as {
        message?: string;
        user?: Record<string, unknown> & { balance?: string | number };
      };

      if (!response.ok) {
        throw new Error(data?.message || "Could not claim welcome bonus.");
      }

      if (data.user) {
        const normalizedBalance = Number(data.user.balance || 0).toFixed(2);
        setBalanceOverride(normalizedBalance);
        localStorage.setItem(
          "survex_user",
          JSON.stringify({
            ...data.user,
            balance: normalizedBalance,
          }),
        );
      }

      setWelcomeBonusMessage(
        data.message || "Welcome bonus claimed successfully.",
      );
      setShowWelcomeBonusModal(false);
    } catch (error) {
      setWelcomeBonusError(
        error instanceof Error ? error.message : "Could not claim welcome bonus.",
      );
    } finally {
      setIsClaimingWelcomeBonus(false);
    }
  }

  if (!hasSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
          <p className="text-sm text-slate-400">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="earn" balanceOverride={balanceOverride} />

        {welcomeBonusMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
            {welcomeBonusMessage}
          </div>
        ) : null}

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
              {surveyWalls.map((wall) =>
                wall.href ? (
                  <Link
                    key={wall.name}
                    href={wall.href}
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
                ),
              )}
            </div>
          </div>
        </section>

        {/* <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
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
        </section> */}

        <SiteFooter />
      </div>

      {showWelcomeBonusModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-slate-900 shadow-2xl">
            <div className="p-7 md:p-8">
              <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500/15 text-5xl">
                🐷
              </div>

              <h2 className="text-2xl font-black text-white">Welcome Bonus</h2>
              <p className="mt-4 text-base text-slate-200">
                We are excited to have you in Survex.
              </p>
              <p className="mt-3 text-slate-300">
                Claim your one-time welcome gift of{" "}
                <span className="font-extrabold text-emerald-300">
                  $ {welcomeBonusAmount.toFixed(2)} USD
                </span>{" "}
                and start your journey today.
              </p>
              <p className="mt-4 border-t border-white/10 pt-4 text-sm font-semibold text-slate-300">
                Minimum withdrawal is $ 5.00 USD
              </p>

              {welcomeBonusError ? (
                <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {welcomeBonusError}
                </p>
              ) : null}
            </div>

            <div className="border-t border-white/10 bg-slate-950/70 px-7 py-5 md:px-8">
              <button
                type="button"
                onClick={handleClaimWelcomeBonus}
                disabled={isClaimingWelcomeBonus}
                className="w-full rounded-2xl border border-emerald-400 bg-emerald-500 px-5 py-3 text-base font-black text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="text-breathe-fade">
                  {isClaimingWelcomeBonus ? "Claiming..." : "Claim Reward"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
