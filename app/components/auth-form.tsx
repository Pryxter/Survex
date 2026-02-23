"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
        },
      ) => number;
      reset: (widgetId?: number) => void;
    };
    onSurvexRecaptchaReady?: () => void;
  }
}

type AuthFormProps = {
  mode: "signup" | "login";
  title: string;
  subtitle: string;
  submitLabel: string;
  showConfirmPassword?: boolean;
  showPrivacyConsent?: boolean;
};

const DEVICE_ID_STORAGE_KEY = "survex_device_id";

function generateDeviceId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `dev-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateDeviceId() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const existing = localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (existing && existing.trim()) {
      return existing.trim();
    }

    const created = generateDeviceId();
    localStorage.setItem(DEVICE_ID_STORAGE_KEY, created);
    return created;
  } catch {
    return generateDeviceId();
  }
}

export default function AuthForm({
  mode,
  title,
  subtitle,
  submitLabel,
  showConfirmPassword = true,
  showPrivacyConsent = true,
}: AuthFormProps) {
  const router = useRouter();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaEnabled = mode === "signup" && Boolean(recaptchaSiteKey);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");

  function resetRecaptcha() {
    if (
      recaptchaEnabled &&
      recaptchaWidgetIdRef.current !== null &&
      window.grecaptcha?.reset
    ) {
      window.grecaptcha.reset(recaptchaWidgetIdRef.current);
      setRecaptchaToken("");
    }
  }

  useEffect(() => {
    if (!recaptchaEnabled) {
      return;
    }

    const scriptId = "google-recaptcha-script";
    const renderWidget = () => {
      if (
        !window.grecaptcha ||
        !recaptchaContainerRef.current ||
        recaptchaWidgetIdRef.current !== null
      ) {
        return;
      }

      recaptchaWidgetIdRef.current = window.grecaptcha.render(
        recaptchaContainerRef.current,
        {
          sitekey: recaptchaSiteKey,
          callback: (token: string) => {
            setRecaptchaToken(token);
          },
          "expired-callback": () => {
            setRecaptchaToken("");
          },
          "error-callback": () => {
            setRecaptchaToken("");
          },
        },
      );
    };

    window.onSurvexRecaptchaReady = renderWidget;

    if (window.grecaptcha?.render) {
      renderWidget();
      return () => {
        window.onSurvexRecaptchaReady = undefined;
      };
    }

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=onSurvexRecaptchaReady&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    return () => {
      window.onSurvexRecaptchaReady = undefined;
    };
  }, [recaptchaEnabled, recaptchaSiteKey]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const deviceId = getOrCreateDeviceId();

    const recaptchaTokenFromForm = String(
      formData.get("g-recaptcha-response") || "",
    ).trim();
    const effectiveRecaptchaToken = (
      recaptchaToken || recaptchaTokenFromForm
    ).trim();

    const payload = {
      firstName: String(formData.get("firstName") || "").trim(),
      lastName: String(formData.get("lastName") || "").trim(),
      addressLine1: String(formData.get("addressLine1") || "").trim(),
      addressLine2: String(formData.get("addressLine2") || "").trim(),
      zipCode: String(formData.get("zipCode") || "").trim(),
      age: String(formData.get("age") || "").trim(),
      gender: String(formData.get("gender") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
      acceptAll: Boolean(formData.get("acceptAll")),
      recaptchaToken: effectiveRecaptchaToken,
      deviceId,
    };

    if (mode === "signup") {
      if (!/^\d{5}$/.test(payload.zipCode)) {
        setErrorMessage(
          "Please use the 5-digit format for your ZIP Code (e.g. 00000).",
        );
        return;
      }

      const ageNumber = Number(payload.age);
      if (!Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 120) {
        setErrorMessage("Please provide a valid age between 13 and 120.");
        return;
      }

      if (!["male", "female"].includes(payload.gender.toLowerCase())) {
        setErrorMessage("Please select Male or Female.");
        return;
      }

      if (recaptchaEnabled && !payload.recaptchaToken) {
        setErrorMessage("Please complete the reCAPTCHA verification.");
        return;
      }
    }

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const endpoint =
      mode === "signup" ? "/api/auth/register" : "/api/auth/login";

    try {
      setIsSubmitting(true);
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.message || "Authentication failed.");
        resetRecaptcha();
        return;
      }

      if (data?.token) {
        localStorage.setItem("survex_token", data.token);
      }
      if (data?.user) {
        localStorage.setItem("survex_user", JSON.stringify(data.user));
      }

      router.push("/dashboard");
    } catch {
      setErrorMessage("Could not connect to the server. Try again.");
      resetRecaptcha();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      <p className="mt-3 text-slate-300">{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="First name"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="addressLine1"
                className="mb-2 block text-sm font-medium"
              >
                Your address (line 1):
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Street and number"
              />
            </div>

            <div>
              <label
                htmlFor="addressLine2"
                className="mb-2 block text-sm font-medium"
              >
                Your address (line 2):
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Apartment, suite, etc. (optional)"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label
                  htmlFor="zipCode"
                  className="mb-2 block text-sm font-medium"
                >
                  What is your ZIP code?
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  required
                  pattern="\d{5}"
                  inputMode="numeric"
                  maxLength={5}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="00000"
                />
                <p className="mt-2 text-xs text-slate-400">
                  Please use the 5-digit format for your ZIP Code (e.g. 00000)
                </p>
              </div>

              <div>
                <label htmlFor="age" className="mb-2 block text-sm font-medium">
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min={13}
                  max={120}
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="18"
                />
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
          </>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Minimum 8 characters"
          />
        </div>

        {showConfirmPassword ? (
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="w-full rounded-xl border border-white/15 bg-slate-900/80 px-4 py-3 outline-none ring-cyan-300 transition focus:ring-2"
              placeholder="Repeat your password"
            />
          </div>
        ) : null}

        {showPrivacyConsent ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <p className="text-sm leading-relaxed text-slate-300">
              We care about your privacy. By accepting the fields below, you
              agree to share your personal data with us to receive our surveys
              and earn rewards for your participation.
            </p>
            <label className="mt-4 flex items-start gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                name="acceptAll"
                required
                className="mt-1 h-4 w-4 rounded border-white/30 bg-slate-900 accent-cyan-300"
              />
              <span>
                I accept the{" "}
                <Link
                  href="/Privacy"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Privacy Policy
                </Link>{" "}
                ,{" "}
                <Link
                  href="/Cookies"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Cookies Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/Terms"
                  className="font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Terms and Conditions
                </Link>{" "}
                of this website.
              </span>
            </label>
          </div>
        ) : null}

        {recaptchaEnabled ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <p className="mb-3 text-sm text-slate-300">
              Please interact with the CAPTCHA below:
            </p>
            <div ref={recaptchaContainerRef} />
          </div>
        ) : null}

        {errorMessage ? (
          <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || (recaptchaEnabled && !recaptchaToken)}
          className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Please wait..." : submitLabel}
        </button>
      </form>
    </section>
  );
}
