import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";

import { useStatusesQuery, type Status } from "@/entities/status";
import type { Ticket } from "@/entities/ticket";
import { useMoveTicketOnBoard } from "@/features/move-ticket-on-board";
import { Skeleton } from "@/shared/ui/skeleton";

import { TicketBoardCardContent } from "./ticket-board-card";
import { TicketBoardColumn } from "./ticket-board-column";

type TicketsBoardProps = {
  tickets: Ticket[];
  onTicketOpen: (ticketId: number) => void;
};

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function groupTicketsByStatus(tickets: Ticket[], statuses: Status[]): Map<number, Ticket[]> {
  const groups = new Map<number, Ticket[]>(statuses.map((status) => [status.id, []]));

  for (const ticket of tickets) {
    const bucket = groups.get(ticket.status.id);
    if (bucket) {
      bucket.push(ticket);
    }
  }

  return groups;
}

export function TicketsBoard({ tickets, onTicketOpen }: TicketsBoardProps) {
  const statusesQuery = useStatusesQuery(true);
  const statuses = statusesQuery.data ?? [];
  const { displayTickets, pendingTicketId, moveTicket, resolveDropStatus } =
    useMoveTicketOnBoard(tickets);
  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor),
  );

  const grouped = useMemo(
    () => groupTicketsByStatus(displayTickets, statuses),
    [displayTickets, statuses],
  );
  const activeTicket = displayTickets.find((ticket) => ticket.id === activeTicketId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTicketId(Number(event.active.id));
  }

  function handleDragCancel() {
    setActiveTicketId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const ticketId = Number(event.active.id);
    const nextStatus = resolveDropStatus(event.over?.id, statuses);
    setActiveTicketId(null);

    if (!nextStatus || Number.isNaN(ticketId)) {
      return;
    }

    void moveTicket(ticketId, nextStatus);
  }

  if (statusesQuery.isPending) {
    return <TicketsBoardSkeleton />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-1">
        {statuses.map((status) => (
          <TicketBoardColumn
            key={status.id}
            status={status}
            tickets={grouped.get(status.id) ?? []}
            pendingTicketId={pendingTicketId}
            onTicketOpen={onTicketOpen}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTicket ? (
          <TicketBoardCardContent ticket={activeTicket} className="shadow-lg ring-1 ring-border" />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export function TicketsBoardSkeleton() {
  return (
    <div className="flex h-full min-h-0 gap-4 overflow-x-auto pb-1">
      {Array.from({ length: 3 }, (_, columnIndex) => (
        <section
          key={columnIndex}
          className="flex h-full w-72 shrink-0 flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between px-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-6" />
          </div>
          {Array.from({ length: 3 }, (_, cardIndex) => (
            <div key={cardIndex} className="space-y-2 rounded-md border border-border bg-card p-3">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
