const DEFAULT_API_ORIGIN = "http://localhost:8080";

/**
 * API origin only — never includes `/api`.
 * Empty string in production means same-origin requests (nginx proxies `/api`).
 */
export function getApiOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === undefined || raw === null) {
    return DEFAULT_API_ORIGIN;
  }

  const trimmed = String(raw).trim();
  if (trimmed === "") {
    return "";
  }

  return trimmed.replace(/\/$/, "");
}
