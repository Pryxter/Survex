"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

type AdminUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  balance: string | number;
  user_role: string;
  is_banned: boolean;
  banned_at: string | null;
  banned_reason: string | null;
  signup_ip: string | null;
  last_login_ip: string | null;
  last_login_at: string | null;
  created_at: string;
};

type AdminWithdrawal = {
  id: number;
  user_id: number;
  user_email: string | null;
  reward_method: string;
  amount: string | number;
  status: string;
  payout_reference?: string | null;
  created_at: string;
};

type AdminTicket = {
  id: number;
  user_id: number | null;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  created_at: string;
};

type AdminOverviewResponse = {
  users?: AdminUser[];
  withdrawals?: AdminWithdrawal[];
  tickets?: AdminTicket[];
  message?: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingWithdrawalId, setPendingWithdrawalId] = useState<number | null>(
    null,
  );
  const [pendingTicketId, setPendingTicketId] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  const counts = useMemo(
    () => ({
      users: users.length,
      banned: users.filter((user) => user.is_banned).length,
      withdrawals: withdrawals.length,
      tickets: tickets.length,
    }),
    [users, withdrawals, tickets],
  );

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/admin/overview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as AdminOverviewResponse;
        if (!response.ok) {
          throw new Error(data.message || "Could not load admin panel.");
        }
        return data;
      })
      .then((data) => {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setWithdrawals(Array.isArray(data.withdrawals) ? data.withdrawals : []);
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load admin panel.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  async function handleToggleBan(user: AdminUser) {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setPendingUserId(user.id);

    const nextIsBanned = !user.is_banned;
    let reason = "";
    if (nextIsBanned) {
      const promptValue = window.prompt(
        "Optional ban reason:",
        user.banned_reason || "",
      );
      if (promptValue === null) {
        setPendingUserId(null);
        return;
      }
      reason = promptValue.trim();
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/admin/users/${user.id}/ban`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isBanned: nextIsBanned,
          reason,
        }),
      });

      const data = (await response.json()) as {
        user?: {
          user_role?: string;
          is_banned?: boolean;
        };
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not update user status.");
      }

      setUsers((previous) =>
        previous.map((item) =>
          item.id === user.id
            ? {
                ...item,
                is_banned: Boolean(data.user?.is_banned),
                banned_at: nextIsBanned ? new Date().toISOString() : null,
                banned_reason: nextIsBanned ? reason : null,
              }
            : item,
        ),
      );

      setStatusMessage(
        data.message ||
          (nextIsBanned ? "User banned successfully." : "User unbanned successfully."),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update user status.",
      );
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleWithdrawalStatusChange(
    withdrawal: AdminWithdrawal,
    nextStatus: "approved" | "rejected",
  ) {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    let payoutReference = "";
    if (nextStatus === "approved") {
      const promptValue = window.prompt(
        "Enter Gift Card code or Transaction number:",
        String(withdrawal.payout_reference || ""),
      );

      if (promptValue === null) {
        return;
      }

      payoutReference = promptValue.trim();
      if (!payoutReference) {
        setErrorMessage(
          "Gift Card code or transaction number is required to approve.",
        );
        return;
      }
    }

    setPendingWithdrawalId(withdrawal.id);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/api/admin/withdrawals/${withdrawal.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: nextStatus,
            payoutReference,
          }),
        },
      );

      const data = (await response.json()) as {
        message?: string;
        withdrawal?: {
          status?: string;
          payout_reference?: string;
        };
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not update withdrawal.");
      }

      setWithdrawals((previous) =>
        previous.map((item) =>
          item.id === withdrawal.id
            ? {
                ...item,
                status: String(data.withdrawal?.status || nextStatus),
                payout_reference: data.withdrawal?.payout_reference || null,
              }
            : item,
        ),
      );
      setStatusMessage(data.message || "Withdrawal status updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update withdrawal.",
      );
    } finally {
      setPendingWithdrawalId(null);
    }
  }

  async function handleTicketStatusChange(
    ticket: AdminTicket,
    nextStatus: "open" | "closed",
  ) {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setPendingTicketId(ticket.id);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/api/admin/tickets/${ticket.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );

      const data = (await response.json()) as {
        message?: string;
        ticket?: {
          status?: string;
        };
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not update ticket.");
      }

      setTickets((previous) =>
        previous.map((item) =>
          item.id === ticket.id
            ? { ...item, status: String(data.ticket?.status || nextStatus) }
            : item,
        ),
      );
      setStatusMessage(data.message || "Ticket status updated successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update ticket.",
      );
    } finally {
      setPendingTicketId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="admin" />

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Admin / Owner
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Control Panel</h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Review registered users, withdrawal requests, support tickets, and ban
            suspicious accounts.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Users</p>
              <p className="mt-1 text-2xl font-black">{counts.users}</p>
            </div>
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="text-xs uppercase tracking-wide text-red-300">
                Banned Users
              </p>
              <p className="mt-1 text-2xl font-black text-red-200">{counts.banned}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Withdrawals
              </p>
              <p className="mt-1 text-2xl font-black">{counts.withdrawals}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Tickets</p>
              <p className="mt-1 text-2xl font-black">{counts.tickets}</p>
            </div>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-300">Loading admin data...</p>
          ) : null}

          {statusMessage ? (
            <p className="mt-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {statusMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Registered Users</h2>
          {users.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No users found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">ID</th>
                    <th className="py-3 pr-3 font-semibold">Email</th>
                    <th className="py-3 pr-3 font-semibold">Name</th>
                    <th className="py-3 pr-3 font-semibold">Role</th>
                    <th className="py-3 pr-3 font-semibold">Balance</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Signup IP</th>
                    <th className="py-3 pr-3 font-semibold">Last Login IP</th>
                    <th className="py-3 pr-3 font-semibold">Created</th>
                    <th className="py-3 pr-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isOwner = String(user.user_role || "").toLowerCase() === "owner";
                    return (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-3 pr-3">{user.id}</td>
                        <td className="py-3 pr-3">{user.email}</td>
                        <td className="py-3 pr-3">
                          {[user.first_name, user.last_name].filter(Boolean).join(" ") || "-"}
                        </td>
                        <td className="py-3 pr-3">
                          <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">
                            {user.user_role || "user"}
                          </span>
                        </td>
                        <td className="py-3 pr-3">$ {Number(user.balance || 0).toFixed(2)}</td>
                        <td className="py-3 pr-3">
                          {user.is_banned ? (
                            <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-bold text-red-300">
                              Banned
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3">{user.signup_ip || "-"}</td>
                        <td className="py-3 pr-3">
                          {user.last_login_ip || "-"}
                          <div className="text-xs text-slate-400">
                            {formatDate(user.last_login_at)}
                          </div>
                        </td>
                        <td className="py-3 pr-3">{formatDate(user.created_at)}</td>
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            disabled={pendingUserId === user.id || isOwner}
                            onClick={() => handleToggleBan(user)}
                            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                              user.is_banned
                                ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                                : "border border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25"
                            } disabled:cursor-not-allowed disabled:opacity-60`}
                          >
                            {isOwner
                              ? "Protected"
                              : pendingUserId === user.id
                                ? "Saving..."
                                : user.is_banned
                                  ? "Unban"
                                  : "Ban"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Withdrawal Requests</h2>
          {withdrawals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No withdrawal requests found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">ID</th>
                    <th className="py-3 pr-3 font-semibold">User</th>
                    <th className="py-3 pr-3 font-semibold">Method</th>
                    <th className="py-3 pr-3 font-semibold">Amount</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Gift Card / Tx</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                    <th className="py-3 pr-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((item) => (
                    <tr key={item.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">#{item.id}</td>
                      <td className="py-3 pr-3">
                        {item.user_email || "Unknown user"}
                        <div className="text-xs text-slate-400">ID: {item.user_id}</div>
                      </td>
                      <td className="py-3 pr-3">{item.reward_method}</td>
                      <td className="py-3 pr-3">$ {Number(item.amount || 0).toFixed(2)}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{item.payout_reference || "-"}</td>
                      <td className="py-3 pr-3">{formatDate(item.created_at)}</td>
                      <td className="py-3 pr-3">
                        {String(item.status).toLowerCase() === "requested" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleWithdrawalStatusChange(item, "approved")
                              }
                              disabled={pendingWithdrawalId === item.id}
                              className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pendingWithdrawalId === item.id ? "Saving..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleWithdrawalStatusChange(item, "rejected")
                              }
                              disabled={pendingWithdrawalId === item.id}
                              className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Support Tickets</h2>
          {tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No support tickets found.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Ticket</th>
                    <th className="py-3 pr-3 font-semibold">Email</th>
                    <th className="py-3 pr-3 font-semibold">Subject</th>
                    <th className="py-3 pr-3 font-semibold">Message</th>
                    <th className="py-3 pr-3 font-semibold">Category</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                    <th className="py-3 pr-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">#{ticket.id}</td>
                      <td className="py-3 pr-3">{ticket.email}</td>
                      <td className="py-3 pr-3">{ticket.subject}</td>
                      <td className="py-3 pr-3">{ticket.message}</td>
                      <td className="py-3 pr-3">{ticket.category}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{formatDate(ticket.created_at)}</td>
                      <td className="py-3 pr-3">
                        {String(ticket.status).toLowerCase() === "closed" ? (
                          <button
                            type="button"
                            onClick={() => handleTicketStatusChange(ticket, "open")}
                            disabled={pendingTicketId === ticket.id}
                            className="rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {pendingTicketId === ticket.id ? "Saving..." : "Reopen"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleTicketStatusChange(ticket, "closed")}
                            disabled={pendingTicketId === ticket.id}
                            className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {pendingTicketId === ticket.id ? "Saving..." : "Close"}
                          </button>
                        )}
                      </td>
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
