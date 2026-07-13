import { useState } from "react";

import type { Status } from "@/entities/status";
import type { Ticket } from "@/entities/ticket";
import { useUpdateTicketStatus } from "@/features/update-ticket-status";

export function useMoveTicketOnBoard(tickets: Ticket[]) {
  const { updateStatus, pendingTicketId } = useUpdateTicketStatus();
  const [optimisticStatuses, setOptimisticStatuses] = useState<Partial<Record<number, Status>>>({});

  const displayTickets = tickets.map((ticket) => {
    const optimisticStatus = optimisticStatuses[ticket.id];
    return optimisticStatus ? { ...ticket, status: optimisticStatus } : ticket;
  });

  async function moveTicket(ticketId: number, nextStatus: Status) {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.status.id === nextStatus.id) {
      return;
    }

    setOptimisticStatuses((current) => ({ ...current, [ticketId]: nextStatus }));

    try {
      await updateStatus(ticketId, nextStatus.id);
    } catch {
      // Server state remains the source of truth; clear optimistic override.
    } finally {
      setOptimisticStatuses((current) => {
        const next = { ...current };
        delete next[ticketId];
        return next;
      });
    }
  }

  function resolveDropStatus(
    overId: string | number | undefined,
    statuses: Status[],
  ): Status | null {
    if (overId === undefined) return null;
    const value = String(overId);

    const byColumn = statuses.find((status) => String(status.id) === value);
    if (byColumn) {
      return byColumn;
    }

    const overTicket = displayTickets.find((ticket) => String(ticket.id) === value);
    return overTicket?.status ?? null;
  }

  return {
    displayTickets,
    pendingTicketId,
    moveTicket,
    resolveDropStatus,
  };
}
