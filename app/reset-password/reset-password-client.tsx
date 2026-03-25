"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "../components/api-base";

type ResetStatus = "idle" | "success";

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => String(searchParams.get("token") || "").trim(),
    [searchParams],
  );

  const [status, setStatus] = useState<ResetStatus>("idle");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage(
        "Reset token is missing. Request a new password reset email.",
      );
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data?.message || "Could not reset password.");
        return;
      }

      setStatus("success");
      setSuccessMessage(
        data?.message ||
          "Your password was reset successfully. You can now log in.",
      );
      setPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Could not connect to the server. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Reset Password</h1>
      <p className="mt-3 text-slate-300">
        Set a new password for your Survex account.
      </p>

      {!token ? (
        <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          <p>Reset token is missing or invalid.</p>
          <p className="mt-2 text-red-200">
            Request a new password reset email from Forgot Password.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block rounded-full border border-red-300 px-5 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/20"
          >
            Go to Forgot Password
          </Link>
        </div>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
              placeholder="Repeat your new password"
            />
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

          {status === "success" ? (
            <Link
              href="/login"
              className="inline-block rounded-full bg-emerald-300 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
            >
              Continue to Login
            </Link>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          )}
        </form>
      )}
    </section>
  );
}
