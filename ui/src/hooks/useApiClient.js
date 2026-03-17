import { useMemo } from "react";
import { normalizeApiBaseUrl } from "../lib/appConfig";

export function useApiClient(apiBaseUrl, apiKey) {
  const normalizedApiBaseUrl = useMemo(
    () => normalizeApiBaseUrl(apiBaseUrl),
    [apiBaseUrl],
  );

  const headers = useMemo(() => {
    const output = { "Content-Type": "application/json" };
    if (apiKey.trim()) {
      output["X-API-Key"] = apiKey.trim();
    }
    return output;
  }, [apiKey]);

  const callJson = async (path, options = {}) => {
    const response = await fetch(`${normalizedApiBaseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    const body = await response.text();
    let parsed;

    try {
      parsed = body ? JSON.parse(body) : null;
    } catch {
      parsed = body;
    }

    if (!response.ok) {
      const detail = parsed?.detail || parsed || `HTTP ${response.status}`;
      throw new Error(String(detail));
    }

    return parsed;
  };

  return { callJson, normalizedApiBaseUrl };
}
