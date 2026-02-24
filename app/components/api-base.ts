function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalHostName(hostname: string) {
  const normalized = String(hostname || "").trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1";
}

function isLocalApiUrl(url: string) {
  try {
    const parsed = new URL(url);
    return isLocalHostName(parsed.hostname);
  } catch {
    return false;
  }
}

export function getApiBaseUrl() {
  const configuredRaw = String(process.env.NEXT_PUBLIC_API_URL || "").trim();
  const configured = configuredRaw ? normalizeBaseUrl(configuredRaw) : "";

  if (typeof window !== "undefined") {
    const isRunningOnLocalhost = isLocalHostName(window.location.hostname);

    // Ignore accidental localhost API URL when running from a VPS/real domain.
    if (configured && !(isLocalApiUrl(configured) && !isRunningOnLocalhost)) {
      return configured;
    }

    if (isRunningOnLocalhost) {
      return "http://localhost:5000";
    }

    // In production, default to same origin (works well behind reverse proxies).
    return normalizeBaseUrl(window.location.origin);
  }

  return configured || "http://localhost:5000";
}
