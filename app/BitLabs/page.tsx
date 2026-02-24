"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardNavbar from "../components/dashboard-navbar";
import { getApiBaseUrl } from "../components/api-base";

type BitLabsSurvey = {
  id: string;
  name: string;
  reward: string;
  loi: number | null;
  country: string;
  entryUrl: string | null;
};

type SurveysResponse = {
  source: "bitlabs" | "demo";
  surveys: BitLabsSurvey[];
  message?: string;
};

export default function BitLabsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"bitlabs" | "demo" | null>(null);
  const [surveys, setSurveys] = useState<BitLabsSurvey[]>([]);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const embeddedSurvey = surveys.find((survey) => Boolean(survey.entryUrl));

  function toUiErrorMessage(message: string) {
    const normalized = String(message || "").trim();
    if (!normalized) {
      return "Failed to load surveys.";
    }

    return normalized.length > 260
      ? `${normalized.slice(0, 260)}...`
      : normalized;
  }

  useEffect(() => {
    const token = localStorage.getItem("survex_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiBaseUrl = getApiBaseUrl();

    fetch(`${apiBaseUrl}/api/bitlabs/surveys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        const data = (await response.json()) as SurveysResponse & {
          details?: string;
        };

        if (!response.ok) {
          throw new Error(data.details || data.message || "Failed to load surveys.");
        }

        setSource(data.source || "demo");
        setSurveys(Array.isArray(data.surveys) ? data.surveys : []);
        setInfoMessage(String(data.message || "").trim());
      })
      .catch((error) => {
        setErrorMessage(toUiErrorMessage(error.message || "Failed to load surveys."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-7xl p-6 md:p-8">
        <DashboardNavbar activeTab="earn" />

        <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            BitLabs
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
            Available Surveys
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Complete surveys and receive rewards. Duplicate completion checks are
            active to prevent fraud.
          </p>

          {source === "demo" && !errorMessage ? (
            <p className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Demo mode active. Configure BitLabs API credentials in backend env
              to load live surveys.
            </p>
          ) : null}

          {infoMessage ? (
            <p className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
              {infoMessage}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}

          {loading ? (
            <p className="mt-6 text-sm text-slate-300">Loading surveys...</p>
          ) : errorMessage ? null : (
            <>
              {embeddedSurvey?.entryUrl ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                  <iframe
                    src={embeddedSurvey.entryUrl}
                    title="BitLabs Surveys"
                    className="h-[78vh] w-full"
                    allow="clipboard-read; clipboard-write"
                  />
                </div>
              ) : (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {surveys.length === 0 ? (
                    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                      No surveys available right now.
                    </article>
                  ) : (
                    surveys.map((survey) => (
                      <article
                        key={`${survey.id}-${survey.name}`}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <p className="text-lg font-bold">{survey.name}</p>
                        <div className="mt-3 space-y-1 text-sm text-slate-300">
                          <p>Reward: ${survey.reward}</p>
                          <p>Estimated time: {survey.loi ?? "N/A"} min</p>
                          <p>Country: {survey.country}</p>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
