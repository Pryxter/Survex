"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "../components/api-base";

const PENDING_EMAIL_STORAGE_KEY = "survex_pending_verification_email";

export default function ConfirmEmailClient() {
  const searchParams = useSearchParams();
  const emailFromQuery = useMemo(
    () => String(searchParams.get("email") || "").trim().toLowerCase(),
    [searchParams],
  );

  const [email, setEmail] = useState(emailFromQuery);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (emailFromQuery) {
      setEmail(emailFromQuery);
      localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, emailFromQuery);
      return;
    }

    const storedEmail = String(
      localStorage.getItem(PENDING_EMAIL_STORAGE_KEY) || "",
    )
      .trim()
      .toLowerCase();

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, [emailFromQuery]);

  async function handleResendVerification() {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("Please provide your email first.");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    try {
      setIsResendingVerification(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await fetch(`${apiBaseUrl}/api/auth/resend-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data?.message || "Could not resend verification email.");
        return;
      }

      localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, normalizedEmail);
      setSuccessMessage(
        data?.message ||
          "Verification email sent. If you do not see it, check your spam folder.",
      );
    } catch {
      setErrorMessage("Could not connect to the server. Try again.");
    } finally {
      setIsResendingVerification(false);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-300/30 bg-white/[0.04] p-6 shadow-2xl backdrop-blur md:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">
        One Last Step
      </p>
      <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
        Confirm your email to activate your account
      </h1>
      <p className="mt-3 text-slate-300">
        We sent a verification link to your email. You need to confirm it before
        you can log in and start earning.
      </p>

      <div className="mt-6 rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-4">
        <label htmlFor="confirmEmail" className="mb-2 block text-sm font-semibold">
          Email address
        </label>
        <input
          id="confirmEmail"
          name="confirmEmail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
          placeholder="you@example.com"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <p className="text-sm font-semibold text-slate-100">What to do now:</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Open your email inbox and look for the Survex verification email.</li>
          <li>Click the confirmation link to activate your account.</li>
          <li>If you do not see it, check your spam or junk folder.</li>
          <li>Need a new email? Use the resend button below.</li>
        </ol>
      </div>

      {errorMessage ? (
        <p className="mt-5 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isResendingVerification}
          className="cursor-pointer rounded-full bg-cyan-300 px-5 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isResendingVerification ? "Resending..." : "Resend verification email"}
        </button>
        <Link
          href="/login"
          className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-bold text-slate-200 transition hover:border-cyan-300/60 hover:text-cyan-200"
        >
          Go to Login
        </Link>
      </div>
    </section>
  );
}
