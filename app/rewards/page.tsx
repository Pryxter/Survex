"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

const rewardOptions = [
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

const withdrawalAmounts = [5, 10, 15, 20];

type MeResponse = {
  user?: {
    id: number;
    email: string;
    balance: string | number;
  };
  message?: string;
};

type RedeemResponse = {
  user?: {
    id: number;
    email: string;
    balance: string | number;
  };
  message?: string;
};

export default function RewardsPage() {
  const router = useRouter();
  const [balance, setBalance] = useState("0.00");
  const [selectedReward, setSelectedReward] = useState(rewardOptions[0]);
  const [selectedAmount, setSelectedAmount] = useState(withdrawalAmounts[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const numericBalance = useMemo(() => Number(balance || 0), [balance]);
  const hasEnoughBalance = numericBalance >= selectedAmount;

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as MeResponse;
        if (!response.ok) {
          throw new Error(data.message || "Could not load account.");
        }
        return data;
      })
      .then((data) => {
        const nextBalance = Number(data.user?.balance || 0).toFixed(2);
        setBalance(nextBalance);
        if (data.user) {
          localStorage.setItem("survex_user", JSON.stringify(data.user));
        }
      })
      .catch(() => {
        // Keep local fallback if API is not available.
      });
  }, [router]);

  function handleRequestWithdraw() {
    setErrorMessage("");
    setStatusMessage("");
    if (!hasEnoughBalance) {
      setErrorMessage("You do not have enough balance for this withdrawal.");
      return;
    }
    setIsConfirmOpen(true);
  }

  async function handleConfirmWithdraw() {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/rewards/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: selectedAmount,
          rewardMethod: selectedReward,
        }),
      });

      const data = (await response.json()) as RedeemResponse;
      if (!response.ok) {
        throw new Error(data.message || "Withdrawal failed.");
      }

      const nextBalance = Number(data.user?.balance || 0).toFixed(2);
      setBalance(nextBalance);
      if (data.user) {
        localStorage.setItem("survex_user", JSON.stringify(data.user));
      }
      setIsConfirmOpen(false);
      setStatusMessage("Withdrawal request submitted successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Withdrawal failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="rewards" balanceOverride={balance} />

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Rewards
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Redeem your points
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Exchange your balance for gift cards or cash options. More payout
            partners will be available soon.
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-slate-300">
              Current Balance:{" "}
              <span className="font-bold text-emerald-300">
                $ {Number(balance || 0).toFixed(2)}
              </span>
            </p>

            <p className="mt-4 text-sm font-semibold text-slate-200">
              Select withdrawal amount
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {withdrawalAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setSelectedAmount(amount)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    selectedAmount === amount
                      ? "border-cyan-300/70 bg-cyan-400/10 text-cyan-200"
                      : "border-white/15 bg-white/5 text-slate-200 hover:border-cyan-300/60 hover:text-cyan-200"
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-300">
                Selected reward:{" "}
                <span className="font-semibold text-white">
                  {selectedReward}
                </span>
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRequestWithdraw}
                disabled={isSubmitting}
                className="rounded-full bg-cyan-300 px-5 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Withdraw ${selectedAmount}
              </button>
              {!hasEnoughBalance ? (
                <p className="text-sm text-amber-300">
                  Not enough balance for this amount.
                </p>
              ) : null}
            </div>

            {statusMessage ? (
              <p className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {statusMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rewardOptions.map((reward) => {
              const selected = reward === selectedReward;
              return (
                <button
                  key={reward}
                  type="button"
                  onClick={() => setSelectedReward(reward)}
                  className={`rounded-2xl border bg-white/5 p-4 text-left transition ${
                    selected
                      ? "border-cyan-300/70 ring-1 ring-cyan-300/60"
                      : "border-white/10 hover:border-cyan-300/60"
                  }`}
                >
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-800/70">
                    <Image
                      // src="/rewards/amazon.svg"
                      src={`/rewards/${reward}.svg`}
                      alt={`${reward} reference`}
                      width={640}
                      height={360}
                      className="h-24 w-full object-cover"
                    />
                  </div>
                  <p className="mt-3 text-center text-base font-bold">
                    {reward}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <SiteFooter />
      </div>

      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold">Confirm withdrawal</h2>
            <p className="mt-3 text-sm text-slate-300">
              Are you sure you want to withdraw{" "}
              <span className="font-bold text-white">${selectedAmount}</span>{" "}
              using{" "}
              <span className="font-bold text-white">{selectedReward}</span>?
            </p>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={isSubmitting}
                className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={isSubmitting}
                className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Processing..." : "Yes, withdraw"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
