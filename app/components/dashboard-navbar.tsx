"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "./api-base";

type DashboardNavbarProps = {
  activeTab?: "earn" | "rewards" | "profile" | "support" | "admin";
  balanceOverride?: string | number;
};

type StoredUser = {
  id: number;
  email: string;
  balance?: string | number;
  user_role?: string;
};

export default function DashboardNavbar({
  activeTab = "earn",
  balanceOverride,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [balance, setBalance] = useState("0.00");
  const [userRole, setUserRole] = useState("user");
  const [rewardToastText, setRewardToastText] = useState("");
  const lastKnownBalanceRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseItemClass =
    "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors";

  const getItemClass = (tab: "earn" | "rewards" | "support" | "admin") =>
    `${baseItemClass} ${
      activeTab === tab
        ? "border-cyan-300/70 bg-cyan-400/10 text-cyan-200"
        : "border-white/10 bg-white/5 hover:border-cyan-300/60 hover:text-cyan-200"
    }`;

  const profileClass =
    "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors " +
    (activeTab === "profile"
      ? "border-cyan-300/70 bg-cyan-400/10 text-cyan-200"
      : "border-white/15 bg-white/5 hover:border-cyan-300/60 hover:text-cyan-200");

  function showRewardToast(deltaAmount: number) {
    const normalized = Number(deltaAmount || 0);
    if (!Number.isFinite(normalized) || normalized <= 0) {
      return;
    }

    setRewardToastText(`+$${normalized.toFixed(2)}`);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setRewardToastText("");
      toastTimerRef.current = null;
    }, 10000);
  }

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    const apiBaseUrl = getApiBaseUrl();
    const storedUserRaw = localStorage.getItem("survex_user");

    if (storedUserRaw) {
      try {
        const parsedUser = JSON.parse(storedUserRaw) as StoredUser;
        const parsedBalance = Number(parsedUser.balance || 0);
        const nextBalance = Number(parsedBalance || 0).toFixed(2);
        const nextRole = String(parsedUser.user_role || "user").toLowerCase();
        Promise.resolve().then(() => {
          setBalance(nextBalance);
          setUserRole(nextRole);
          if (Number.isFinite(parsedBalance)) {
            lastKnownBalanceRef.current = parsedBalance;
          }
        });
      } catch {
        // Ignore invalid local storage shape.
      }
    }

    if (!token) {
      return;
    }

    let isUnmounted = false;

    const syncSession = async (notifyOnIncrease: boolean) => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Session error");
        }

        if (!data?.user || isUnmounted) {
          return;
        }

        const latestBalance = Number(data.user.balance || 0);
        const previousBalance = lastKnownBalanceRef.current;
        if (
          notifyOnIncrease &&
          Number.isFinite(latestBalance) &&
          previousBalance !== null &&
          latestBalance > previousBalance
        ) {
          showRewardToast(latestBalance - previousBalance);
        }

        lastKnownBalanceRef.current = Number.isFinite(latestBalance)
          ? latestBalance
          : previousBalance;

        localStorage.setItem("survex_user", JSON.stringify(data.user));
        setBalance(Number(data.user.balance || 0).toFixed(2));
        setUserRole(String(data.user.user_role || "user").toLowerCase());
      } catch {
        // Keep the local fallback balance if request fails.
      }
    };

    syncSession(false);
    const intervalId = setInterval(() => {
      syncSession(true);
    }, 10000);

    return () => {
      isUnmounted = true;
      clearInterval(intervalId);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const displayBalance =
    balanceOverride === undefined || balanceOverride === null
      ? balance
      : Number(balanceOverride || 0).toFixed(2);
  const canAccessAdmin = userRole === "owner" || userRole === "admin";

  function handleLogout() {
    localStorage.removeItem("survex_token");
    localStorage.removeItem("survex_user");
    router.push("/login");
  }

  return (
    <>
      {rewardToastText ? (
        <div className="fixed right-4 top-4 z-50 rounded-xl border border-emerald-300/50 bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-200 shadow-lg shadow-emerald-500/20 md:right-6 md:top-6">
          Reward received {rewardToastText}
        </div>
      ) : null}
      <header className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="mr-1 text-2xl font-black tracking-tight">
              SURVEX<span className="text-cyan-300">.app</span>
            </p>
            <Link href="/dashboard" className={getItemClass("earn")}>
              Earn
            </Link>
            <Link href="/rewards" className={getItemClass("rewards")}>
              Rewards
            </Link>
            <Link href="/support" className={getItemClass("support")}>
              Support
            </Link>
            {canAccessAdmin ? (
              <Link href="/admin" className={getItemClass("admin")}>
                Admin
              </Link>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-200">
              $ {displayBalance}
            </div>
            <Link href="/profile" className={profileClass}>
              My Profile
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-red-400/40 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-300 hover:text-red-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
