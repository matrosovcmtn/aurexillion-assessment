import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { isApiError } from "@/shared/api/api-error";
import { httpDelete, httpGet } from "@/shared/api/http-client";

afterEach(() => {
  vi.unstubAllGlobals();
});

function stubFetch(response: Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(response)),
  );
}

describe("httpRequest", () => {
  it("resolves to undefined on a 204 with an empty body", async () => {
    stubFetch(new Response(null, { status: 204 }));

    await expect(httpDelete("/tickets/1")).resolves.toBeUndefined();
  });

  it("surfaces a status-based error for a non-JSON gateway error page", async () => {
    stubFetch(new Response("<html>502 Bad Gateway</html>", { status: 502 }));

    const error = await httpGet("/tickets").catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    if (isApiError(error)) {
      expect(error.status).toBe(502);
      expect(error.message).not.toMatch(/invalid JSON/i);
    }
  });

  it("still flags a genuinely malformed body on a successful response", async () => {
    stubFetch(new Response("not json", { status: 200 }));

    const error = await httpGet("/tickets").catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    if (isApiError(error)) {
      expect(error.message).toMatch(/invalid JSON/i);
    }
  });
});
