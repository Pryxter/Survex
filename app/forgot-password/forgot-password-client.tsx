"use client";

import { FormEvent, useState } from "react";
import { getApiBaseUrl } from "../components/api-base";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("Please provide your email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data?.message || "Could not process this request.");
        return;
      }

      setSuccessMessage(
        data?.message ||
          "If your account exists, we sent a password reset link. Check your inbox and spam folder.",
      );
    } catch {
      setErrorMessage("Could not connect to the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Forgot Password</h1>
      <p className="mt-3 text-slate-300">
        Enter your account email and we will send a link to reset your password.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="relative">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="you@example.com"
          />
          <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
          </span>
        </div>

        {errorMessage ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </section>
  );
}
