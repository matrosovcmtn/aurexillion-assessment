import { ApiError, type ApiErrorResponse } from "@/shared/api/api-error";
import { apiUrl } from "@/shared/lib/normalize-api-url";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
};

async function parseJsonBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    // A non-JSON body on a failed request is usually a gateway/proxy error page
    // (502/504 while the backend restarts) rather than a malformed API response —
    // let toApiError build a message from the status instead of masking it here.
    if (!response.ok) {
      return undefined;
    }

    throw new ApiError({
      message: "Server returned an invalid JSON response",
      status: response.status,
    });
  }
}

function toApiError(status: number, payload: unknown): ApiError {
  if (payload && typeof payload === "object" && "error" in payload) {
    const errorPayload = payload as ApiErrorResponse;
    if (typeof errorPayload.error === "string") {
      return new ApiError({
        message: errorPayload.error,
        status,
        details: Array.isArray(errorPayload.details) ? errorPayload.details : undefined,
      });
    }
  }

  if (status >= 500) {
    return new ApiError({
      message: "Server is temporarily unavailable. Please try again.",
      status,
    });
  }

  return new ApiError({
    message: `Request failed with status ${status}`,
    status,
  });
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, signal } = options;

  const headers = new Headers();
  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError({
      message: "Unable to reach the server. Check your connection and try again.",
      status: 0,
    });
  }

  const payload = await parseJsonBody(response);

  if (!response.ok) {
    throw toApiError(response.status, payload);
  }

  return payload as T;
}

export function httpGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return httpRequest<T>(path, { method: "GET", signal });
}

export function httpPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return httpRequest<T>(path, { method: "POST", body, signal });
}

export function httpPatch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return httpRequest<T>(path, { method: "PATCH", body, signal });
}

export function httpPut<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return httpRequest<T>(path, { method: "PUT", body, signal });
}

export function httpDelete(path: string, signal?: AbortSignal): Promise<void> {
  return httpRequest<void>(path, { method: "DELETE", signal });
}
