import { formatDateTime } from "@/shared/lib/format-date";

import { TICKET_PRIORITY_OPTIONS } from "./constants";
import type { TicketPriority } from "./types";

export function formatTicketPriority(priority: TicketPriority): string {
  return TICKET_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}

export function formatTicketCreatedAt(createdAt: string): string {
  return formatDateTime(createdAt);
}

export function formatTicketDeadline(deadline: string | null | undefined): string {
  if (!deadline) {
    return "No deadline";
  }
  return formatDateTime(deadline);
}

/** True when the deadline's local calendar day is today or earlier. */
export function isDeadlineDueOrPast(deadline: string | null | undefined): boolean {
  if (!deadline) {
    return false;
  }

  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDay = new Date(date);
  deadlineDay.setHours(0, 0, 0, 0);

  return deadlineDay.getTime() <= today.getTime();
}

export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

export function isTicketPriority(value: string): value is TicketPriority {
  return TICKET_PRIORITY_OPTIONS.some((option) => option.value === value);
}

export function parsePositiveInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}
