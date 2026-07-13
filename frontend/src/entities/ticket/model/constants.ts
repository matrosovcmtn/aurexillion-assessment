import type { TicketPriority } from "./types";

export const TICKET_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const satisfies ReadonlyArray<{ value: TicketPriority; label: string }>;

export const TICKET_PRIORITIES = TICKET_PRIORITY_OPTIONS.map((option) => option.value);
