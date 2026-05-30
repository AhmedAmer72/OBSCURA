/** Browser-persisted Obscura agent token (set at /docs/agents). Never log or commit. */

const STORAGE_KEY = "obscura.agentToken.v1";

export function getAgentToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw?.trim() || null;
  } catch {
    return null;
  }
}

export function setAgentToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token.trim());
}

export function clearAgentToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_NOTIFICATIONS_URL as string | undefined) ??
    (import.meta.env.VITE_RELAY_URL as string | undefined) ??
    "https://obscura-api-n62v.onrender.com"
  ).replace(/\/$/, "");
}

export async function fetchAgentApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAgentToken();
  if (!token) {
    throw new Error("Agent token required — create one at /docs/agents");
  }
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API ${path} failed (${response.status})${body ? `: ${body}` : ""}`);
  }
  return response.json() as Promise<T>;
}
