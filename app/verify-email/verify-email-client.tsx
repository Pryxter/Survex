"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getApiBaseUrl } from "../components/api-base";

type VerifyStatus = "loading" | "success" | "error";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = useMemo(
    () => String(searchParams.get("token") || "").trim(),
    [searchParams],
  );

  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState(
    "Validating your verification link...",
  );

  useEffect(() => {
    async function runVerification() {
      if (!token) {
        setStatus("error");
        setMessage(
          "Verification token is missing. Request a new verification email from Login.",
        );
        return;
      }

      try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(
          `${apiBaseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(
            data?.message ||
              "The verification link is invalid or expired. Please request a new one.",
          );
          return;
        }

        setStatus("success");
        setMessage(
          data?.message ||
            "Welcome! Your account was confirmed successfully. You can now log in.",
        );
      } catch {
        setStatus("error");
        setMessage("Could not connect to the server. Please try again.");
      }
    }

    runVerification();
  }, [token]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Email Verification</h1>
      <p className="mt-3 text-slate-300">
        Confirm your account to unlock Survex and start earning.
      </p>

      {status === "loading" ? (
        <p className="mt-6 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </p>
      ) : null}

      {status === "success" ? (
        <div className="mt-6 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100">
          <p>{message}</p>
          <Link
            href="/login"
            className="mt-4 inline-block cursor-pointer rounded-full bg-emerald-300 px-5 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-200"
          >
            Continue to Login
          </Link>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          <p>{message}</p>
          <p className="mt-3 text-red-200">
            If you do not see your email, check your spam folder.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block cursor-pointer rounded-full border border-red-300 px-5 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/20"
          >
            Go to Login to Resend
          </Link>
        </div>
      ) : null}
    </section>
  );
}
