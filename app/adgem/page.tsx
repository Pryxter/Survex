"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiBaseUrl } from "../components/api-base";

type AdGemSurvey = {
  id: string;
  name: string;
  reward: string;
  loi: number | null;
  country: string;
  entryUrl: string | null;
};

type AdGemSurveysResponse = {
  source: "adgem" | "demo";
  surveys: AdGemSurvey[];
  message?: string;
};

export default function AdGemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"adgem" | "demo" | null>(null);
  const [entryUrl, setEntryUrl] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();
    fetch(`${apiBaseUrl}/api/adgem/surveys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as AdGemSurveysResponse;
        if (!response.ok) {
          throw new Error(data.message || "Failed to load AdGem.");
        }
        return data;
      })
      .then((data) => {
        setSource(data.source || "demo");
        setInfoMessage(String(data.message || "").trim());
        const firstSurvey = Array.isArray(data.surveys) ? data.surveys[0] : null;
        setEntryUrl(String(firstSurvey?.entryUrl || "").trim());
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load AdGem.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Link
        href="/dashboard"
        className="fixed left-4 top-4 z-[1000000] rounded-full border border-white/20 bg-slate-950/90 px-4 py-2 text-sm font-bold text-slate-100 backdrop-blur hover:border-cyan-300/60 hover:text-cyan-200"
      >
        Back to Dashboard
      </Link>

      {loading ? (
        <div className="px-6 py-10 text-slate-100">
          <p className="text-sm text-slate-300">Loading AdGem...</p>
        </div>
      ) : errorMessage ? (
        <div className="px-6 py-10 text-slate-100">
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        </div>
      ) : (
        <>
          {source === "demo" && infoMessage ? (
            <div className="px-6 pt-16 text-slate-100">
              <p className="rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
                {infoMessage}
              </p>
            </div>
          ) : null}

          {entryUrl ? (
            <iframe
              src={entryUrl}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: "100%",
                height: "100%",
                border: "none",
                margin: 0,
                padding: 0,
                overflow: "hidden",
                zIndex: 999999,
              }}
            >
              Your browser doesn&apos;t support iframes
            </iframe>
          ) : (
            <div className="px-6 py-10 text-slate-100">
              <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                No AdGem wall URL configured yet.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
