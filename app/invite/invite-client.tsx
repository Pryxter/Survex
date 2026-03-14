"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

type ReferredUser = {
  id: number;
  email: string;
  created_at: string;
};

type ReferralResponse = {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  totalReferralEarnings: string | number;
  referredUsers: ReferredUser[];
  message?: string;
};

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

export default function InviteClient() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState<ReferralResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/referrals/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as ReferralResponse;
        if (!response.ok) {
          throw new Error(data.message || "Could not load referral details.");
        }
        return data;
      })
      .then((data) => {
        setReferralData(data);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not load referral details.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  async function handleCopy() {
    if (!referralData?.referralLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setErrorMessage("Could not copy referral link.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="invite" />

        <section
          className="rgb-border-shift mt-8 rounded-3xl p-[1px]"
          style={{
            backgroundImage:
              "linear-gradient(120deg, #67e8f9, #38bdf8, #f43f5e, #fb7185, #67e8f9)",
            backgroundSize: "250% 250%",
          }}
        >
          <div className="rounded-[calc(1.5rem-1px)] bg-slate-900/90 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Invite Friends
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Share your link and earn 5%
          </h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            For every referred user, you earn 5% of their credited survey
            rewards. Share your unique referral link below.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-300">Loading referral data...</p>
          ) : null}

          {errorMessage ? (
            <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {referralData && !isLoading ? (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Total Referrals
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {Number(referralData.totalReferrals || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <p className="text-xs uppercase tracking-wide text-emerald-300">
                    Total Referral Earnings
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-200">
                    $ {Number(referralData.totalReferralEarnings || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Your Referral Link
                </p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  <input
                    type="text"
                    readOnly
                    value={referralData.referralLink}
                    className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                  >
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Referred Users
                </p>
                {referralData.referredUsers.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-300">
                    No referrals yet. Share your link to start earning referral
                    rewards.
                  </p>
                ) : (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400">
                          <th className="py-3 pr-3 font-semibold">User ID</th>
                          <th className="py-3 pr-3 font-semibold">Email</th>
                          <th className="py-3 pr-3 font-semibold">Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referralData.referredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-white/5">
                            <td className="py-3 pr-3">{user.id}</td>
                            <td className="py-3 pr-3">{user.email}</td>
                            <td className="py-3 pr-3">{formatDate(user.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : null}
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
