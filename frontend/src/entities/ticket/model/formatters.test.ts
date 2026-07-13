import { describe, expect, it } from "vite-plus/test";

import {
  formatTicketDeadline,
  fromDatetimeLocalValue,
  isDeadlineDueOrPast,
  toDatetimeLocalValue,
} from "./formatters";

describe("formatTicketDeadline", () => {
  it("returns a clear label when deadline is missing", () => {
    expect(formatTicketDeadline(null)).toBe("No deadline");
    expect(formatTicketDeadline(undefined)).toBe("No deadline");
  });
});

describe("isDeadlineDueOrPast", () => {
  it("treats today and earlier local days as due", () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    expect(isDeadlineDueOrPast(today.toISOString())).toBe(true);
    expect(isDeadlineDueOrPast(yesterday.toISOString())).toBe(true);
    expect(isDeadlineDueOrPast(tomorrow.toISOString())).toBe(false);
    expect(isDeadlineDueOrPast(null)).toBe(false);
  });
});

describe("datetime-local helpers", () => {
  it("round-trips a local datetime value through ISO", () => {
    const local = toDatetimeLocalValue("2026-07-01T17:00:00.000Z");
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

    const iso = fromDatetimeLocalValue(local);
    expect(iso).toBeTruthy();
    expect(fromDatetimeLocalValue("")).toBeNull();
  });
});
