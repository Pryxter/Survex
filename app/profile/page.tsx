"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

type ProfileResponse = {
  profile?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2: string;
    zip_code: string;
    age: number | null;
    gender: string;
    balance: string | number;
    created_at: string;
  };
  surveyHistory?: Array<{
    id: string | number;
    survey_id: string;
    transaction_id: string;
    reward: string | number;
    status_raw: string;
    outcome: "Completed" | "Disqualified" | "Reversed" | string;
    source: string;
    created_at: string;
  }>;
  redemptionHistory?: Array<{
    id: number;
    reward_method: string;
    amount: string | number;
    status: string;
    payout_reference?: string;
    created_at: string;
  }>;
  message?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [profileData, setProfileData] = useState<ProfileResponse["profile"]>();
  const [surveyHistory, setSurveyHistory] = useState<
    NonNullable<ProfileResponse["surveyHistory"]>
  >([]);
  const [redemptionHistory, setRedemptionHistory] = useState<
    NonNullable<ProfileResponse["redemptionHistory"]>
  >([]);

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as ProfileResponse;
        if (!response.ok) {
          throw new Error(data.message || "Unable to load profile.");
        }
        return data;
      })
      .then((data) => {
        setProfileData(data.profile);
        setSurveyHistory(data.surveyHistory || []);
        setRedemptionHistory(data.redemptionHistory || []);

        if (data.profile) {
          const existingUserRaw = localStorage.getItem("survex_user");
          if (existingUserRaw) {
            try {
              const existingUser = JSON.parse(existingUserRaw) as Record<string, unknown>;
              localStorage.setItem(
                "survex_user",
                JSON.stringify({
                  ...existingUser,
                  balance: data.profile.balance,
                }),
              );
            } catch {
              // Ignore parse error and keep local storage untouched.
            }
          }
        }
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load profile.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar
          activeTab="profile"
          balanceOverride={profileData?.balance}
        />

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            My Profile
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Account Overview
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Your personal information is shown here as read-only.
          </p>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-300">Loading profile...</p>
          ) : null}

          {errorMessage ? (
            <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {profileData && !isLoading ? (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
                <p className="mt-1 font-semibold">{profileData.email}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  First Name
                </p>
                <p className="mt-1 font-semibold">{profileData.first_name || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Last Name
                </p>
                <p className="mt-1 font-semibold">{profileData.last_name || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Address (Line 1)
                </p>
                <p className="mt-1 font-semibold">{profileData.address_line1 || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Address (Line 2)
                </p>
                <p className="mt-1 font-semibold">{profileData.address_line2 || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">ZIP Code</p>
                <p className="mt-1 font-semibold">{profileData.zip_code || "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Age</p>
                <p className="mt-1 font-semibold">{profileData.age ?? "-"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Gender</p>
                <p className="mt-1 font-semibold">{profileData.gender || "-"}</p>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-emerald-300">
                  Balance
                </p>
                <p className="mt-1 font-semibold text-emerald-200">
                  $ {Number(profileData.balance || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 sm:col-span-2 lg:col-span-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Account Created
                </p>
                <p className="mt-1 font-semibold">
                  {formatDate(profileData.created_at)}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Survey History</h2>
          <p className="mt-2 text-sm text-slate-300">
            Completed and disqualified surveys with value and date.
          </p>

          {surveyHistory.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No survey history yet.</p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Survey ID</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Value</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {surveyHistory.map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">{item.survey_id || "-"}</td>
                      <td className="py-3 pr-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            item.outcome === "Completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : item.outcome === "Reversed"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {item.outcome}
                        </span>
                      </td>
                      <td className="py-3 pr-3">$ {Number(item.reward || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Rewards Redemption History</h2>
          <p className="mt-2 text-sm text-slate-300">
            Your gift card and cash-out withdrawal requests.
          </p>

          {redemptionHistory.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">
              No withdrawal requests yet.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Reward</th>
                    <th className="py-3 pr-3 font-semibold">Amount</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptionHistory.map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">{item.reward_method}</td>
                      <td className="py-3 pr-3">$ {Number(item.amount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">
                          {item.status}
                        </span>
                        {item.payout_reference ? (
                          <p className="mt-1 text-xs text-emerald-300">
                            Code/Tx: {item.payout_reference}
                          </p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3">{formatDate(item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
