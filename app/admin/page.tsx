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
  signup_country_code: string | null;
  signup_state: string | null;
  signup_city: string | null;
  last_login_ip: string | null;
  last_login_country_code: string | null;
  last_login_state: string | null;
  last_login_city: string | null;
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

type AdminLoginEvent = {
  id: number;
  user_id: number;
  user_email: string | null;
  login_ip: string | null;
  country_code: string | null;
  state: string | null;
  city: string | null;
  created_at: string;
};

type AdminSurveyCompletion = {
  user_id: number;
  user_email: string | null;
  survey_id: string;
  status_raw: string | null;
  reward: string | number;
  source: string | null;
  created_at: string;
};

type AdminOverviewResponse = {
  users?: AdminUser[];
  withdrawals?: AdminWithdrawal[];
  tickets?: AdminTicket[];
  loginEvents?: AdminLoginEvent[];
  surveyCompletions?: AdminSurveyCompletion[];
  message?: string;
};

type WithdrawalActionDialog =
  | {
      mode: "approved" | "rejected";
      withdrawal: AdminWithdrawal;
    }
  | null;

const ROWS_PER_PAGE = 6;

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

type TablePaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
};

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: TablePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-slate-400">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
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
  const [pendingWithdrawalDeleteId, setPendingWithdrawalDeleteId] = useState<
    number | null
  >(null);
  const [pendingTicketId, setPendingTicketId] = useState<number | null>(null);
  const [withdrawalActionDialog, setWithdrawalActionDialog] =
    useState<WithdrawalActionDialog>(null);
  const [withdrawalActionInput, setWithdrawalActionInput] = useState("");
  const [withdrawalActionError, setWithdrawalActionError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loginEvents, setLoginEvents] = useState<AdminLoginEvent[]>([]);
  const [surveyCompletions, setSurveyCompletions] = useState<
    AdminSurveyCompletion[]
  >([]);
  const [usersPage, setUsersPage] = useState(1);
  const [withdrawalsPage, setWithdrawalsPage] = useState(1);
  const [loginEventsPage, setLoginEventsPage] = useState(1);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [surveyCompletionsPage, setSurveyCompletionsPage] = useState(1);
  const [surveySearchQuery, setSurveySearchQuery] = useState("");

  const counts = useMemo(
    () => ({
      users: users.length,
      banned: users.filter((user) => user.is_banned).length,
      withdrawals: withdrawals.length,
      tickets: tickets.length,
      loginEvents: loginEvents.length,
      surveyCompletions: surveyCompletions.length,
    }),
    [users, withdrawals, tickets, loginEvents, surveyCompletions],
  );

  const usersTotalPages = useMemo(
    () => Math.max(1, Math.ceil(users.length / ROWS_PER_PAGE)),
    [users.length],
  );
  const withdrawalsTotalPages = useMemo(
    () => Math.max(1, Math.ceil(withdrawals.length / ROWS_PER_PAGE)),
    [withdrawals.length],
  );
  const loginEventsTotalPages = useMemo(
    () => Math.max(1, Math.ceil(loginEvents.length / ROWS_PER_PAGE)),
    [loginEvents.length],
  );
  const ticketsTotalPages = useMemo(
    () => Math.max(1, Math.ceil(tickets.length / ROWS_PER_PAGE)),
    [tickets.length],
  );
  const normalizedSurveySearch = useMemo(
    () => surveySearchQuery.trim().toLowerCase(),
    [surveySearchQuery],
  );
  const filteredSurveyCompletions = useMemo(() => {
    if (!normalizedSurveySearch) {
      return surveyCompletions;
    }

    return surveyCompletions.filter((item) => {
      const userIdText = String(item.user_id || "");
      const emailText = String(item.user_email || "").toLowerCase();
      return (
        userIdText.includes(normalizedSurveySearch) ||
        emailText.includes(normalizedSurveySearch)
      );
    });
  }, [normalizedSurveySearch, surveyCompletions]);
  const surveyCompletionsTotalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredSurveyCompletions.length / ROWS_PER_PAGE)),
    [filteredSurveyCompletions.length],
  );

  const paginatedUsers = useMemo(() => {
    const offset = (usersPage - 1) * ROWS_PER_PAGE;
    return users.slice(offset, offset + ROWS_PER_PAGE);
  }, [users, usersPage]);

  const paginatedWithdrawals = useMemo(() => {
    const offset = (withdrawalsPage - 1) * ROWS_PER_PAGE;
    return withdrawals.slice(offset, offset + ROWS_PER_PAGE);
  }, [withdrawals, withdrawalsPage]);

  const paginatedLoginEvents = useMemo(() => {
    const offset = (loginEventsPage - 1) * ROWS_PER_PAGE;
    return loginEvents.slice(offset, offset + ROWS_PER_PAGE);
  }, [loginEvents, loginEventsPage]);

  const paginatedTickets = useMemo(() => {
    const offset = (ticketsPage - 1) * ROWS_PER_PAGE;
    return tickets.slice(offset, offset + ROWS_PER_PAGE);
  }, [tickets, ticketsPage]);
  const paginatedSurveyCompletions = useMemo(() => {
    const offset = (surveyCompletionsPage - 1) * ROWS_PER_PAGE;
    return filteredSurveyCompletions.slice(offset, offset + ROWS_PER_PAGE);
  }, [filteredSurveyCompletions, surveyCompletionsPage]);

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
        setLoginEvents(Array.isArray(data.loginEvents) ? data.loginEvents : []);
        setSurveyCompletions(
          Array.isArray(data.surveyCompletions) ? data.surveyCompletions : [],
        );
        setUsersPage(1);
        setWithdrawalsPage(1);
        setLoginEventsPage(1);
        setTicketsPage(1);
        setSurveyCompletionsPage(1);
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

  useEffect(() => {
    if (usersPage > usersTotalPages) {
      setUsersPage(usersTotalPages);
    }
  }, [usersPage, usersTotalPages]);

  useEffect(() => {
    if (withdrawalsPage > withdrawalsTotalPages) {
      setWithdrawalsPage(withdrawalsTotalPages);
    }
  }, [withdrawalsPage, withdrawalsTotalPages]);

  useEffect(() => {
    if (loginEventsPage > loginEventsTotalPages) {
      setLoginEventsPage(loginEventsTotalPages);
    }
  }, [loginEventsPage, loginEventsTotalPages]);

  useEffect(() => {
    if (ticketsPage > ticketsTotalPages) {
      setTicketsPage(ticketsTotalPages);
    }
  }, [ticketsPage, ticketsTotalPages]);

  useEffect(() => {
    if (surveyCompletionsPage > surveyCompletionsTotalPages) {
      setSurveyCompletionsPage(surveyCompletionsTotalPages);
    }
  }, [surveyCompletionsPage, surveyCompletionsTotalPages]);

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
    payoutReferenceInput = "",
  ) {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return false;
    }

    setErrorMessage("");
    setStatusMessage("");

    const payoutReference = String(payoutReferenceInput || "").trim();
    if (nextStatus === "approved" && !payoutReference) {
      setErrorMessage("Gift Card code or transaction number is required to approve.");
      return false;
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
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not update withdrawal.",
      );
      return false;
    } finally {
      setPendingWithdrawalId(null);
    }
  }

  function openApproveWithdrawalDialog(withdrawal: AdminWithdrawal) {
    setWithdrawalActionDialog({ mode: "approved", withdrawal });
    setWithdrawalActionInput(String(withdrawal.payout_reference || ""));
    setWithdrawalActionError("");
    setErrorMessage("");
    setStatusMessage("");
  }

  function openRejectWithdrawalDialog(withdrawal: AdminWithdrawal) {
    setWithdrawalActionDialog({ mode: "rejected", withdrawal });
    setWithdrawalActionInput("");
    setWithdrawalActionError("");
    setErrorMessage("");
    setStatusMessage("");
  }

  function closeWithdrawalActionDialog() {
    if (withdrawalActionDialog) {
      const currentId = withdrawalActionDialog.withdrawal.id;
      if (pendingWithdrawalId === currentId) {
        return;
      }
    }

    setWithdrawalActionDialog(null);
    setWithdrawalActionInput("");
    setWithdrawalActionError("");
  }

  async function submitWithdrawalActionDialog() {
    if (!withdrawalActionDialog) {
      return;
    }

    const { withdrawal, mode } = withdrawalActionDialog;
    const payoutReference = String(withdrawalActionInput || "").trim();

    if (mode === "approved" && !payoutReference) {
      setWithdrawalActionError(
        "Gift Card code or transaction number is required to approve.",
      );
      return;
    }

    setWithdrawalActionError("");
    const success = await handleWithdrawalStatusChange(
      withdrawal,
      mode,
      payoutReference,
    );

    if (success) {
      closeWithdrawalActionDialog();
    }
  }

  async function handleDeleteWithdrawal(withdrawal: AdminWithdrawal) {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const confirmed = window.confirm(
      `Delete withdrawal request #${withdrawal.id}?`,
    );
    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setStatusMessage("");
    setPendingWithdrawalDeleteId(withdrawal.id);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(
        `${apiBaseUrl}/api/admin/withdrawals/${withdrawal.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = (await response.json()) as {
        message?: string;
        deletedWithdrawalId?: number;
        refundApplied?: boolean;
        refundedUserId?: number | null;
        refundedAmount?: number;
      };

      if (!response.ok) {
        throw new Error(data.message || "Could not delete withdrawal.");
      }

      setWithdrawals((previous) =>
        previous.filter((item) => item.id !== withdrawal.id),
      );

      if (data.refundApplied && data.refundedUserId && data.refundedAmount) {
        setUsers((previous) =>
          previous.map((user) =>
            user.id === data.refundedUserId
              ? {
                  ...user,
                  balance: Number(user.balance || 0) + Number(data.refundedAmount || 0),
                }
              : user,
          ),
        );
      }

      setStatusMessage(data.message || "Withdrawal request deleted.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not delete withdrawal.",
      );
    } finally {
      setPendingWithdrawalDeleteId(null);
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
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
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Login Events
              </p>
              <p className="mt-1 text-2xl font-black">{counts.loginEvents}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Completed Surveys
              </p>
              <p className="mt-1 text-2xl font-black">{counts.surveyCompletions}</p>
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
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[1700px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-3 font-semibold">ID</th>
                      <th className="py-3 pr-3 font-semibold">Email</th>
                      <th className="py-3 pr-3 font-semibold">Name</th>
                      <th className="py-3 pr-3 font-semibold">Role</th>
                      <th className="py-3 pr-3 font-semibold">Balance</th>
                      <th className="py-3 pr-3 font-semibold">Status</th>
                      <th className="py-3 pr-3 font-semibold">Signup IP</th>
                      <th className="py-3 pr-3 font-semibold">Signup Country</th>
                      <th className="py-3 pr-3 font-semibold">Signup State</th>
                      <th className="py-3 pr-3 font-semibold">Signup City</th>
                      <th className="py-3 pr-3 font-semibold">Last Login IP</th>
                      <th className="py-3 pr-3 font-semibold">Last Login Country</th>
                      <th className="py-3 pr-3 font-semibold">Last Login State</th>
                      <th className="py-3 pr-3 font-semibold">Last Login City</th>
                      <th className="py-3 pr-3 font-semibold">Created</th>
                      <th className="py-3 pr-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => {
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
                          <td className="py-3 pr-3">{user.signup_country_code || "-"}</td>
                          <td className="py-3 pr-3">{user.signup_state || "-"}</td>
                          <td className="py-3 pr-3">{user.signup_city || "-"}</td>
                          <td className="py-3 pr-3">
                            {user.last_login_ip || "-"}
                            <div className="text-xs text-slate-400">
                              {formatDate(user.last_login_at)}
                            </div>
                          </td>
                          <td className="py-3 pr-3">{user.last_login_country_code || "-"}</td>
                          <td className="py-3 pr-3">{user.last_login_state || "-"}</td>
                          <td className="py-3 pr-3">{user.last_login_city || "-"}</td>
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
              <TablePagination
                currentPage={usersPage}
                totalPages={usersTotalPages}
                onPageChange={setUsersPage}
              />
            </>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Withdrawal Requests</h2>
          {withdrawals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No withdrawal requests found.</p>
          ) : (
            <>
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
                  {paginatedWithdrawals.map((item) => (
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
                        {(() => {
                          const isRequested =
                            String(item.status).toLowerCase() === "requested";
                          const isBusy =
                            pendingWithdrawalId === item.id ||
                            pendingWithdrawalDeleteId === item.id;

                          return isRequested ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openApproveWithdrawalDialog(item)}
                                disabled={isBusy}
                                className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {pendingWithdrawalId === item.id ? "Saving..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => openRejectWithdrawalDialog(item)}
                                disabled={isBusy}
                                className="rounded-full border border-red-400/40 bg-red-500/15 px-3 py-1.5 text-xs font-bold text-red-200 hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWithdrawal(item)}
                                disabled={isBusy}
                                className="rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {pendingWithdrawalDeleteId === item.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDeleteWithdrawal(item)}
                              disabled={isBusy}
                              className="rounded-full border border-rose-400/40 bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-200 hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pendingWithdrawalDeleteId === item.id ? "Deleting..." : "Delete"}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={withdrawalsPage}
                totalPages={withdrawalsTotalPages}
                onPageChange={setWithdrawalsPage}
              />
            </>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Recent Login Events</h2>
          {loginEvents.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No login events found.</p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Event</th>
                    <th className="py-3 pr-3 font-semibold">User</th>
                    <th className="py-3 pr-3 font-semibold">IP</th>
                    <th className="py-3 pr-3 font-semibold">Country</th>
                    <th className="py-3 pr-3 font-semibold">State</th>
                    <th className="py-3 pr-3 font-semibold">City</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLoginEvents.map((event) => (
                    <tr key={event.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">#{event.id}</td>
                      <td className="py-3 pr-3">
                        {event.user_email || "Unknown user"}
                        <div className="text-xs text-slate-400">
                          ID: {event.user_id}
                        </div>
                      </td>
                      <td className="py-3 pr-3">{event.login_ip || "-"}</td>
                      <td className="py-3 pr-3">{event.country_code || "-"}</td>
                      <td className="py-3 pr-3">{event.state || "-"}</td>
                      <td className="py-3 pr-3">{event.city || "-"}</td>
                      <td className="py-3 pr-3">{formatDate(event.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={loginEventsPage}
                totalPages={loginEventsTotalPages}
                onPageChange={setLoginEventsPage}
              />
            </>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">
            Completed & Reversed Surveys
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Survey history with completed and reversed events. Search by user ID
            or email.
          </p>

          <div className="mt-4 max-w-md">
            <input
              type="text"
              value={surveySearchQuery}
              onChange={(event) => {
                setSurveySearchQuery(event.target.value);
                setSurveyCompletionsPage(1);
              }}
              placeholder="Search user by ID or email..."
              className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300/60 focus:outline-none"
            />
          </div>

          {filteredSurveyCompletions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">
              No completed surveys found for this search.
            </p>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-3 font-semibold">User ID</th>
                      <th className="py-3 pr-3 font-semibold">Email</th>
                      <th className="py-3 pr-3 font-semibold">Survey ID</th>
                      <th className="py-3 pr-3 font-semibold">Status</th>
                      <th className="py-3 pr-3 font-semibold">Value</th>
                      <th className="py-3 pr-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSurveyCompletions.map((item, index) => {
                      const normalizedSource = String(item.source || "")
                        .trim()
                        .toLowerCase();
                      const providerLabel =
                        normalizedSource === "bitlabs"
                          ? "BitLabs"
                          : normalizedSource === "cpx"
                            ? "CPX Research"
                            : "TheoremReach";
                      const statusRaw = String(item.status_raw || "").trim();
                      const normalizedStatus = statusRaw.toLowerCase();
                      const isReversed = [
                        "2",
                        "reversed",
                        "reversal",
                        "chargeback",
                        "reconciliation",
                      ].includes(normalizedStatus);
                      const isCompleted = [
                        "1",
                        "completed",
                        "complete",
                        "credited",
                      ].includes(normalizedStatus);
                      const statusLabel = isReversed
                        ? "Reversed"
                        : isCompleted
                          ? "Completed"
                          : statusRaw || "Completed";

                      return (
                        <tr
                          key={`${item.user_id}-${item.survey_id}-${item.created_at}-${index}`}
                          className="border-b border-white/5"
                        >
                          <td className="py-3 pr-3">{item.user_id}</td>
                          <td className="py-3 pr-3">{item.user_email || "Unknown user"}</td>
                          <td className="py-3 pr-3">
                            {providerLabel} - {item.survey_id || "-"}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold ${
                                isReversed
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-emerald-500/20 text-emerald-300"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            $ {Number(item.reward || 0).toFixed(2)}
                          </td>
                          <td className="py-3 pr-3">{formatDate(item.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <TablePagination
                currentPage={surveyCompletionsPage}
                totalPages={surveyCompletionsTotalPages}
                onPageChange={setSurveyCompletionsPage}
              />
            </>
          )}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Support Tickets</h2>
          {tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No support tickets found.</p>
          ) : (
            <>
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
                  {paginatedTickets.map((ticket) => (
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
              <TablePagination
                currentPage={ticketsPage}
                totalPages={ticketsTotalPages}
                onPageChange={setTicketsPage}
              />
            </>
          )}
        </section>

        {withdrawalActionDialog ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
                Withdrawal Request #{withdrawalActionDialog.withdrawal.id}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold">
                {withdrawalActionDialog.mode === "approved"
                  ? "Approve Withdrawal"
                  : "Reject Withdrawal"}
              </h3>
              <p className="mt-3 text-sm text-slate-300">
                User: {withdrawalActionDialog.withdrawal.user_email || "Unknown user"} | Method:{" "}
                {withdrawalActionDialog.withdrawal.reward_method} | Amount: ${" "}
                {Number(withdrawalActionDialog.withdrawal.amount || 0).toFixed(2)}
              </p>

              {withdrawalActionDialog.mode === "approved" ? (
                <div className="mt-5">
                  <label
                    htmlFor="withdrawalPayoutReference"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Gift Card code or Transaction number
                  </label>
                  <input
                    id="withdrawalPayoutReference"
                    type="text"
                    value={withdrawalActionInput}
                    onChange={(event) => {
                      setWithdrawalActionInput(event.target.value);
                      setWithdrawalActionError("");
                    }}
                    placeholder="Enter code or transaction ID"
                    className="w-full rounded-xl border border-white/15 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none ring-cyan-300 transition focus:ring-2"
                  />
                </div>
              ) : (
                <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="text-sm text-amber-100">
                    Are you sure you want to reject this withdrawal request? The
                    amount will be refunded to the user balance.
                  </p>
                </div>
              )}

              {withdrawalActionError ? (
                <p className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  {withdrawalActionError}
                </p>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeWithdrawalActionDialog}
                  disabled={
                    pendingWithdrawalId === withdrawalActionDialog.withdrawal.id
                  }
                  className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-slate-200 hover:border-slate-300/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitWithdrawalActionDialog}
                  disabled={
                    pendingWithdrawalId === withdrawalActionDialog.withdrawal.id
                  }
                  className={`rounded-full px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                    withdrawalActionDialog.mode === "approved"
                      ? "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25"
                      : "border border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25"
                  }`}
                >
                  {pendingWithdrawalId === withdrawalActionDialog.withdrawal.id
                    ? "Saving..."
                    : withdrawalActionDialog.mode === "approved"
                      ? "Confirm Approve"
                      : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <SiteFooter />
      </div>
    </div>
  );
}
