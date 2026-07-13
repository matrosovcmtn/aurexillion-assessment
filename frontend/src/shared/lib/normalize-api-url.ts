import { getApiOrigin } from "@/shared/config/env";

/** Build a full request URL from an absolute API path (e.g. `/api/tickets`). */
export function apiUrl(path: string): string {
  const origin = getApiOrigin();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
}
