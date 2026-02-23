"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardNavbarProps = {
  activeTab?: "earn" | "rewards" | "invite" | "profile";
  balanceOverride?: string | number;
};

type StoredUser = {
  id: number;
  email: string;
  balance?: string | number;
};

export default function DashboardNavbar({
  activeTab = "earn",
  balanceOverride,
}: DashboardNavbarProps) {
  const router = useRouter();
  const [balance, setBalance] = useState(() => {
    if (typeof window === "undefined") {
      return "0.00";
    }

    const storedUserRaw = localStorage.getItem("survex_user");
    if (!storedUserRaw) {
      return "0.00";
    }

    try {
      const parsedUser = JSON.parse(storedUserRaw) as StoredUser;
      if (parsedUser.balance === undefined) {
        return "0.00";
      }
      return Number(parsedUser.balance).toFixed(2);
    } catch {
      return "0.00";
    }
  });

  const baseItemClass =
    "rounded-xl border px-4 py-2 text-sm font-semibold transition-colors";

  const getItemClass = (tab: "earn" | "rewards" | "invite") =>
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

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    if (!token) {
      return;
    }

    fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Session error");
        }
        return data;
      })
      .then((data) => {
        if (data?.user) {
          localStorage.setItem("survex_user", JSON.stringify(data.user));
          setBalance(Number(data.user.balance || 0).toFixed(2));
        }
      })
      .catch(() => {
        // Keep the local fallback balance if request fails.
      });
  }, []);

  const displayBalance =
    balanceOverride === undefined || balanceOverride === null
      ? balance
      : Number(balanceOverride || 0).toFixed(2);

  function handleLogout() {
    localStorage.removeItem("survex_token");
    localStorage.removeItem("survex_user");
    router.push("/login");
  }

  return (
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
          <a href="#" className={getItemClass("invite")}>
            Invite Friends
          </a>
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
  );
}
