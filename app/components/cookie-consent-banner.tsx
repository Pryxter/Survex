"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "survex_cookie_consent_v1";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const hasAccepted =
          localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
        setIsVisible(!hasAccepted);
      } catch {
        setIsVisible(true);
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  function handleAcceptCookies() {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    } catch {
      // Ignore storage write errors and still hide UI.
    }
    setIsVisible(false);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-3 sm:p-4">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/15 bg-slate-950/95 p-4 shadow-2xl backdrop-blur md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-200">
            <p className="font-extrabold text-white">We use cookies</p>
            <p className="mt-1 text-slate-300">
              This website uses cookies to improve your experience, keep your
              session secure, and analyze traffic. By clicking Accept, you agree
              to our use of cookies.
            </p>
            <Link
              href="/Cookies"
              className="mt-2 inline-block font-semibold text-cyan-300 hover:text-cyan-200"
            >
              Read Cookies Policy
            </Link>
          </div>

          <button
            type="button"
            onClick={handleAcceptCookies}
            className="shrink-0 rounded-xl border border-cyan-300/40 bg-cyan-500/20 px-5 py-2.5 text-sm font-black text-cyan-100 transition hover:bg-cyan-500/30"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
