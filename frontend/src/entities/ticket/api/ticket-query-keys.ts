import type { TicketFilters } from "../model/types";

export const ticketQueryKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketQueryKeys.all, "list"] as const,
  list: (filters: TicketFilters = {}) => [...ticketQueryKeys.lists(), filters] as const,
  details: () => [...ticketQueryKeys.all, "detail"] as const,
  detail: (id: number) => [...ticketQueryKeys.details(), id] as const,
};
