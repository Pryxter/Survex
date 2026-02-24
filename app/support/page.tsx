"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import SiteFooter from "../components/site-footer";
import { getApiBaseUrl } from "../components/api-base";

type SupportTicket = {
  id: number;
  subject: string;
  category: string;
  status: string;
  created_at: string;
};

type SupportListResponse = {
  supportEmail?: string;
  tickets?: SupportTicket[];
  message?: string;
};

type SupportCreateResponse = {
  supportEmail?: string;
  ticket?: SupportTicket;
  message?: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export default function SupportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [supportEmail, setSupportEmail] = useState("support@survex.app");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [balance, setBalance] = useState("0.00");

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/support/tickets/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as SupportListResponse;
        if (!response.ok) {
          throw new Error(data.message || "Could not load support tickets.");
        }
        return data;
      })
      .then((data) => {
        if (data.supportEmail) {
          setSupportEmail(data.supportEmail);
        }
        setTickets(Array.isArray(data.tickets) ? data.tickets : []);
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Could not load support tickets.",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });

    fetch(`${apiBaseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        if (data?.user) {
          setBalance(Number(data.user.balance || 0).toFixed(2));
        }
      })
      .catch(() => {
        // Keep local fallback.
      });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!subject.trim()) {
      setErrorMessage("Subject is required.");
      return;
    }

    if (!message.trim()) {
      setErrorMessage("Message is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/support/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          message: message.trim(),
        }),
      });

      const data = (await response.json()) as SupportCreateResponse;
      if (!response.ok) {
        throw new Error(data.message || "Could not create support ticket.");
      }

      if (data.supportEmail) {
        setSupportEmail(data.supportEmail);
      }

      if (data.ticket) {
        setTickets((previous) => [data.ticket as SupportTicket, ...previous]);
      }

      setSubject("");
      setCategory("general");
      setMessage("");
      setStatusMessage(
        data.message ||
          `Ticket #${data.ticket?.id || ""} submitted successfully.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not create support ticket.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="support" balanceOverride={balance} />

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Support
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Contact Support
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Send us a ticket and our team will review your request. Support
            contact email:{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="font-semibold text-cyan-200 hover:text-cyan-100"
            >
              {supportEmail}
            </a>
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  maxLength={160}
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="Short summary of your issue"
                />
              </div>
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                >
                  <option value="general">General</option>
                  <option value="account">Account</option>
                  <option value="surveys">Surveys</option>
                  <option value="rewards">Rewards</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows={7}
                maxLength={4000}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Describe your issue in detail"
              />
            </div>

            {statusMessage ? (
              <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {statusMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Submit Ticket"}
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <h2 className="text-2xl font-extrabold">Your Tickets</h2>
          {isLoading ? (
            <p className="mt-4 text-sm text-slate-300">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No tickets yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-3 font-semibold">Ticket</th>
                    <th className="py-3 pr-3 font-semibold">Subject</th>
                    <th className="py-3 pr-3 font-semibold">Category</th>
                    <th className="py-3 pr-3 font-semibold">Status</th>
                    <th className="py-3 pr-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-white/5">
                      <td className="py-3 pr-3">#{ticket.id}</td>
                      <td className="py-3 pr-3">{ticket.subject}</td>
                      <td className="py-3 pr-3">{ticket.category}</td>
                      <td className="py-3 pr-3">
                        <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs font-bold text-cyan-300">
                          {ticket.status}
                        </span>
                      </td>
                      <td className="py-3 pr-3">{formatDate(ticket.created_at)}</td>
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
