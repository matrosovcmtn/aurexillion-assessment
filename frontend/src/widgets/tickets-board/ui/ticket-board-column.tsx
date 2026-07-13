import { useDroppable } from "@dnd-kit/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon } from "@hugeicons/core-free-icons";

import type { Status } from "@/entities/status";
import type { Ticket } from "@/entities/ticket";
import { useCreateTicketDialog } from "@/features/create-ticket/ui/create-ticket-dialog";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";

import { TicketBoardCard } from "./ticket-board-card";

type TicketBoardColumnProps = {
  status: Status;
  tickets: Ticket[];
  pendingTicketId: number | null;
  onTicketOpen: (ticketId: number) => void;
};

export function TicketBoardColumn({
  status,
  tickets,
  pendingTicketId,
  onTicketOpen,
}: TicketBoardColumnProps) {
  const { openCreateTicket } = useCreateTicketDialog();
  const { setNodeRef, isOver } = useDroppable({
    id: String(status.id),
    data: {
      type: "column",
      statusId: status.id,
    },
  });

  return (
    <section
      aria-label={`${status.name} column`}
      className={cn(
        "flex h-full min-h-0 w-72 shrink-0 flex-col rounded-lg border border-border bg-muted/30 transition-colors",
        isOver && "border-primary/40 bg-primary/5",
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: status.color }}
            aria-hidden
          />
          <h2 className="truncate text-sm font-medium">{status.name}</h2>
        </div>
        <span className="flex size-5 items-center justify-center rounded-full bg-background text-[0.625rem] text-muted-foreground ring-1 ring-border">
          {tickets.length}
        </span>
      </header>

      <ul ref={setNodeRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <TicketBoardCard
              ticket={ticket}
              disabled={pendingTicketId === ticket.id}
              onOpen={onTicketOpen}
            />
          </li>
        ))}
      </ul>

      {status.isInitial ? (
        <div className="shrink-0 border-t border-border/60 p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => openCreateTicket({ navigateOnSuccess: false })}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            Add ticket
          </Button>
        </div>
      ) : null}
    </section>
  );
}
