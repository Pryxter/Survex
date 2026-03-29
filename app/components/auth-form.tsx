"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "./api-base";

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

type FieldIconName =
  | "user"
  | "home"
  | "building"
  | "globe"
  | "mail"
  | "mapPin"
  | "hash"
  | "gift"
  | "lock";

const DEVICE_ID_STORAGE_KEY = "survex_device_id";
const COUNTRY_OPTIONS: Array<{ code: string; name: string }> = [
  { code: "US", name: "United States" },
  { code: "MX", name: "Mexico" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "PE", name: "Peru" },
  { code: "VE", name: "Venezuela" },
  { code: "UY", name: "Uruguay" },
  { code: "PY", name: "Paraguay" },
  { code: "BO", name: "Bolivia" },
  { code: "EC", name: "Ecuador" },
  { code: "CR", name: "Costa Rica" },
  { code: "PA", name: "Panama" },
  { code: "DO", name: "Dominican Republic" },
  { code: "GT", name: "Guatemala" },
  { code: "SV", name: "El Salvador" },
  { code: "HN", name: "Honduras" },
  { code: "NI", name: "Nicaragua" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "IN", name: "India" },
  { code: "PH", name: "Philippines" },
  { code: "TH", name: "Thailand" },
  { code: "MY", name: "Malaysia" },
  { code: "SG", name: "Singapore" },
  { code: "ID", name: "Indonesia" },
  { code: "VN", name: "Vietnam" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "EG", name: "Egypt" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "TR", name: "Turkey" },
  { code: "IL", name: "Israel" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "GR", name: "Greece" },
];

function FieldIcon({ name }: { name: FieldIconName }) {
  const className = "h-5 w-5";

  if (name === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (name === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 10v10h14V10" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1" />
      </svg>
    );
  }

  if (name === "globe") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
    );
  }

  if (name === "mail") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "mapPin") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "hash") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <path d="M9 3 7 21M17 3l-2 18M4 9h18M3 15h18" />
      </svg>
    );
  }

  if (name === "gift") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
        <rect x="3" y="8" width="18" height="13" rx="2" />
        <path d="M12 8v13M3 12h18M12 8c-1.8 0-4-1-4-3a2 2 0 0 1 4 0M12 8c1.8 0 4-1 4-3a2 2 0 0 0-4 0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

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

function isValidPostalCodeForCountry(
  postalCode: string,
  countryCode: string,
): boolean {
  const normalizedPostalCode = String(postalCode || "").trim();
  const normalizedCountryCode = String(countryCode || "")
    .trim()
    .toUpperCase();

  if (!normalizedPostalCode) {
    return false;
  }

  if (normalizedCountryCode === "US") {
    return /^\d{5}$/.test(normalizedPostalCode);
  }

  if (normalizedCountryCode === "CA") {
    return /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(normalizedPostalCode);
  }

  if (normalizedCountryCode === "GB") {
    return /^[A-Za-z0-9][A-Za-z0-9\s-]{2,9}$/.test(normalizedPostalCode);
  }

  if (normalizedCountryCode === "MX") {
    return /^\d{5}$/.test(normalizedPostalCode);
  }

  return /^[A-Za-z0-9][A-Za-z0-9\s-]{1,14}$/.test(normalizedPostalCode);
}

export default function AuthForm({
  mode,
  title,
  subtitle,
  submitLabel,
  showConfirmPassword = true,
  showPrivacyConsent = true,
}: AuthFormProps) {
  const isLoginMode = mode === "login";
  const isBrandTitle = String(title || "").trim().toLowerCase() === "survex";
  const router = useRouter();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const recaptchaEnabled = mode === "signup" && Boolean(recaptchaSiteKey);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaWidgetIdRef = useRef<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationPendingEmail, setVerificationPendingEmail] = useState("");
  const [referralCodePrefill, setReferralCodePrefill] = useState("");
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

  useEffect(() => {
    if (mode !== "signup" || typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const referral = (
      params.get("ref") ||
      params.get("referral") ||
      params.get("referralCode") ||
      ""
    )
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 24);

    if (referral) {
      setReferralCodePrefill(referral);
    }
  }, [mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setVerificationPendingEmail("");

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
      countryCode: String(formData.get("countryCode") || "")
        .trim()
        .toUpperCase(),
      zipCode: String(formData.get("zipCode") || "").trim(),
      age: String(formData.get("age") || "").trim(),
      gender: String(formData.get("gender") || "").trim(),
      referralCode: String(formData.get("referralCode") || "")
        .trim()
        .toUpperCase(),
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      confirmPassword: String(formData.get("confirmPassword") || ""),
      acceptAll: Boolean(formData.get("acceptAll")),
      recaptchaToken: effectiveRecaptchaToken,
      deviceId,
    };

    if (mode === "signup") {
      if (!/^[A-Z]{2}$/.test(payload.countryCode)) {
        setErrorMessage(
          "Country code must use ISO 2-letter format (e.g. US, MX, AU).",
        );
        return;
      }

      if (!isValidPostalCodeForCountry(payload.zipCode, payload.countryCode)) {
        setErrorMessage(
          payload.countryCode === "US"
            ? "For US, please use the 5-digit ZIP format (e.g. 00000)."
            : "Please provide a valid postal/ZIP code for your selected country.",
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

    const apiBaseUrl = getApiBaseUrl();
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
        if (data?.code === "EMAIL_NOT_VERIFIED") {
          const pendingEmail = String(data?.email || payload.email || "")
            .trim()
            .toLowerCase();
          if (pendingEmail) {
            setVerificationPendingEmail(pendingEmail);
          }
        }

        setErrorMessage(data.message || "Authentication failed.");
        resetRecaptcha();
        return;
      }

      if (data?.requiresEmailVerification) {
        const pendingEmail = String(data?.email || payload.email || "")
          .trim()
          .toLowerCase();
        if (pendingEmail) {
          localStorage.setItem("survex_pending_verification_email", pendingEmail);
          router.push(`/confirm-email?email=${encodeURIComponent(pendingEmail)}`);
          return;
        }

        router.push("/confirm-email");
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

  async function handleResendVerification() {
    const normalizedEmail = String(verificationPendingEmail || "")
      .trim()
      .toLowerCase();
    if (!normalizedEmail) {
      setErrorMessage("Please enter your email first.");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    try {
      setIsResendingVerification(true);
      setErrorMessage("");
      const response = await fetch(
        `${apiBaseUrl}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(
          data?.message || "Could not resend verification email.",
        );
        return;
      }

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
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur md:p-8">
      {isLoginMode ? (
        <p className="text-center text-5xl font-black tracking-tight text-slate-100 md:text-6xl">
          Surv<span className="text-cyan-300">e</span>
          <span className="text-cyan-300">x</span>
        </p>
      ) : null}
      <h1
        className={`font-extrabold ${
          isBrandTitle
            ? "text-center text-5xl font-black tracking-tight text-slate-100 md:text-6xl"
            : isLoginMode
              ? "mt-2 text-center text-2xl md:text-3xl"
              : "text-3xl md:text-4xl"
        }`}
      >
        {isBrandTitle ? (
          <>
            Surv<span className="text-cyan-300">e</span>
            <span className="text-cyan-300">x</span>
          </>
        ) : (
          title
        )}
      </h1>
      <p className={`mt-3 text-slate-300 ${(isLoginMode || isBrandTitle) ? "text-center" : ""}`}>{subtitle}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="relative">
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium"
                >                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="First name"
                />
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="user" />
                </span>
              </div>
              <div className="relative">
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium"
                >                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="Last name"
                />
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="user" />
                </span>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="addressLine1"
                className="mb-2 block text-sm font-medium"
              >                Your address (line 1):
              </label>
              <input
                id="addressLine1"
                name="addressLine1"
                type="text"
                required
                className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Street and number"
              />
              <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                <FieldIcon name="home" />
              </span>
            </div>

            <div className="relative">
              <label
                htmlFor="addressLine2"
                className="mb-2 block text-sm font-medium"
              >                Your address (line 2):
              </label>
              <input
                id="addressLine2"
                name="addressLine2"
                type="text"
                className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Apartment, suite, etc. (optional)"
              />
              <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                <FieldIcon name="building" />
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="relative">
                <label
                  htmlFor="countryCode"
                  className="mb-2 block text-sm font-medium"
                >                  Country
                </label>
                <select
                  id="countryCode"
                  name="countryCode"
                  required
                  defaultValue=""
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 text-sm outline-none ring-cyan-300 transition focus:ring-2"
                >
                  <option value="" disabled>Select country</option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="globe" />
                </span>
                <p className="mt-2 text-xs text-slate-400">
                  Select your country of residence.
                </p>
              </div>

              <div className="relative">
                <label
                  htmlFor="zipCode"
                  className="mb-2 block text-sm font-medium"
                >                  Postal / ZIP Code
                </label>
                <input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  required
                  maxLength={15}
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 text-sm outline-none ring-cyan-300 transition focus:ring-2 placeholder:text-slate-500"
                  placeholder="ZIP / Postal code"
                />
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="mapPin" />
                </span>
                <p className="mt-2 text-xs text-slate-400">
                  Format depends on your country.
                </p>
              </div>

              <div className="relative">
                <label htmlFor="age" className="mb-2 block text-sm font-medium">                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  required
                  min={13}
                  max={120}
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
                  placeholder="18"
                />
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="hash" />
                </span>
              </div>

              <div className="relative">
                <label
                  htmlFor="gender"
                  className="mb-2 block text-sm font-medium"
                >                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue=""
                  className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 text-sm outline-none ring-cyan-300 transition focus:ring-2"
                >
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                  <FieldIcon name="user" />
                </span>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="referralCode"
                className="mb-2 block text-sm font-medium"
              >                Referral Code (optional)
              </label>
              <input
                id="referralCode"
                name="referralCode"
                type="text"
                defaultValue={referralCodePrefill}
                maxLength={24}
                className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 uppercase outline-none ring-cyan-300 transition focus:ring-2"
                placeholder="Enter referral code"
              />
              <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
                <FieldIcon name="gift" />
              </span>
            </div>
          </>
        ) : null}

        <div className="relative">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="you@example.com"
          />
          <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
            <FieldIcon name="mail" />
          </span>
        </div>

        <div className="relative">
          <label htmlFor="password" className="mb-2 block text-sm font-medium">            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
            placeholder="Minimum 8 characters"
          />
          <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
            <FieldIcon name="lock" />
          </span>
          {mode === "login" ? (
            <div className="mt-3 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
              >
                Forgot your password?
              </Link>
            </div>
          ) : null}
        </div>

        {showConfirmPassword ? (
          <div className="relative">
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              className="persist-focus w-full rounded-xl border border-white/15 bg-slate-900/80 py-3 pl-10 pr-4 outline-none ring-cyan-300 transition focus:ring-2"
              placeholder="Repeat your password"
            />
            <span className="pointer-events-none absolute left-3 top-[52px] z-10 -translate-y-1/2 text-cyan-200">
              <FieldIcon name="lock" />
            </span>
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

        {successMessage ? (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </p>
        ) : null}

        {verificationPendingEmail ? (
          <div className="rounded-2xl border border-cyan-300/30 bg-cyan-400/10 p-4">
            <p className="text-sm text-cyan-100">
              If you do not see the verification email, check your spam folder.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="mt-3 cursor-pointer rounded-full border border-cyan-300 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isResendingVerification
                ? "Resending..."
                : "Resend verification email"}
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || (recaptchaEnabled && !recaptchaToken)}
          className="w-full rounded-full bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Please wait..." : submitLabel}
        </button>

        {mode === "login" ? (
          <p className="text-center text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Sign up
            </Link>
          </p>
        ) : null}
      </form>
    </section>
  );
}
