import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { PageResponse } from "@/shared/api";

import {
  createTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
  updateTicketStatus,
} from "./ticket-api";
import { ticketQueryKeys } from "./ticket-query-keys";
import type {
  CreateTicketInput,
  Ticket,
  TicketFilters,
  UpdateTicketInput,
  UpdateTicketStatusInput,
} from "../model/types";

export function useTicketsQuery(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: ticketQueryKeys.list(filters),
    queryFn: ({ signal }) => getTickets(filters, signal),
  });
}

export function useTicketQuery(ticketId: number, enabled = true) {
  return useQuery({
    queryKey: ticketQueryKeys.detail(ticketId),
    queryFn: ({ signal }) => getTicketById(ticketId, signal),
    enabled: enabled && Number.isFinite(ticketId) && ticketId > 0,
  });
}

function upsertTicketInLists(
  page: PageResponse<Ticket> | undefined,
  ticket: Ticket,
  filters: TicketFilters,
): PageResponse<Ticket> | undefined {
  if (!page) {
    return page;
  }

  const matchesStatus = filters.statusId === undefined || filters.statusId === ticket.status.id;
  const matchesPriority =
    !filters.priorities?.length || filters.priorities.includes(ticket.priority);
  const matchesAssignee =
    !filters.assigneeIds?.length ||
    (ticket.assignee != null && filters.assigneeIds.includes(ticket.assignee.id));
  const matches = matchesStatus && matchesPriority && matchesAssignee;

  const withoutCurrent = page.content.filter((item) => item.id !== ticket.id);
  if (!matches) {
    return {
      ...page,
      content: withoutCurrent,
      totalElements: Math.max(
        0,
        page.totalElements - (page.content.length - withoutCurrent.length),
      ),
    };
  }

  const index = page.content.findIndex((item) => item.id === ticket.id);
  const content =
    index === -1
      ? [ticket, ...withoutCurrent]
      : page.content.map((item) => (item.id === ticket.id ? ticket : item));

  return { ...page, content };
}

export function useCreateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTicketInput) => createTicket(input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(ticket.id), ticket);
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });
    },
  });
}

export function useUpdateTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, input }: { ticketId: number; input: UpdateTicketInput }) =>
      updateTicket(ticketId, input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(ticket.id), ticket);

      const listQueries = queryClient.getQueriesData<PageResponse<Ticket>>({
        queryKey: ticketQueryKeys.lists(),
      });

      for (const [queryKey, page] of listQueries) {
        const filters = (queryKey[2] as TicketFilters | undefined) ?? {};
        queryClient.setQueryData(queryKey, upsertTicketInLists(page, ticket, filters));
      }
    },
  });
}

export function useDeleteTicketMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => deleteTicket(ticketId),
    onSuccess: (_data, ticketId) => {
      queryClient.removeQueries({ queryKey: ticketQueryKeys.detail(ticketId) });
      void queryClient.invalidateQueries({ queryKey: ticketQueryKeys.lists() });
    },
  });
}

export function useUpdateTicketStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, input }: { ticketId: number; input: UpdateTicketStatusInput }) =>
      updateTicketStatus(ticketId, input),
    onSuccess: (ticket) => {
      queryClient.setQueryData(ticketQueryKeys.detail(ticket.id), ticket);

      const listQueries = queryClient.getQueriesData<PageResponse<Ticket>>({
        queryKey: ticketQueryKeys.lists(),
      });

      for (const [queryKey, page] of listQueries) {
        const filters = (queryKey[2] as TicketFilters | undefined) ?? {};
        queryClient.setQueryData(queryKey, upsertTicketInLists(page, ticket, filters));
      }
    },
  });
}
