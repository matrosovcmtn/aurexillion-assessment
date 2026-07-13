import { httpDelete, httpGet, httpPatch, httpPost, type PageResponse } from "@/shared/api";

import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  UpdateTicketInput,
  UpdateTicketStatusInput,
} from "../model/types";

function buildTicketsPath(filters?: TicketFilters): string {
  const params = new URLSearchParams();

  if (filters?.q) params.set("q", filters.q);
  if (filters?.statusId !== undefined) params.set("statusId", String(filters.statusId));
  if (filters?.priorities?.length) params.set("priority", filters.priorities.join(","));
  if (filters?.assigneeIds?.length) params.set("assigneeIds", filters.assigneeIds.join(","));
  if (filters?.code) params.set("code", filters.code);
  if (filters?.tagIds?.length) params.set("tagIds", filters.tagIds.join(","));
  if (filters?.page !== undefined) params.set("page", String(filters.page));
  if (filters?.size !== undefined) params.set("size", String(filters.size));
  if (filters?.sort) params.set("sort", filters.sort);

  const query = params.toString();
  return query ? `/api/tickets?${query}` : "/api/tickets";
}

export function getTickets(
  filters?: TicketFilters,
  signal?: AbortSignal,
): Promise<PageResponse<Ticket>> {
  return httpGet<PageResponse<Ticket>>(buildTicketsPath(filters), signal);
}

export function getTicketById(ticketId: number, signal?: AbortSignal): Promise<Ticket> {
  return httpGet<Ticket>(`/api/tickets/${ticketId}`, signal);
}

export function createTicket(input: CreateTicketInput, signal?: AbortSignal): Promise<Ticket> {
  return httpPost<Ticket>("/api/tickets", input, signal);
}

export function updateTicket(
  ticketId: number,
  input: UpdateTicketInput,
  signal?: AbortSignal,
): Promise<Ticket> {
  return httpPatch<Ticket>(`/api/tickets/${ticketId}`, input, signal);
}

export function updateTicketStatus(
  ticketId: number,
  input: UpdateTicketStatusInput,
  signal?: AbortSignal,
): Promise<Ticket> {
  return updateTicket(ticketId, input, signal);
}

export function deleteTicket(ticketId: number, signal?: AbortSignal): Promise<void> {
  return httpDelete(`/api/tickets/${ticketId}`, signal);
}
