import { useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import { TicketCard, type Ticket } from "@/entities/ticket";
import { cn } from "@/shared/lib/cn";

type TicketBoardCardProps = {
  ticket: Ticket;
  disabled?: boolean;
  onOpen: (ticketId: number) => void;
};

export function TicketBoardCard({ ticket, disabled = false, onOpen }: TicketBoardCardProps) {
  const dragOccurredRef = useRef(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(ticket.id),
    disabled,
    data: {
      type: "ticket",
      ticketId: ticket.id,
      status: ticket.status,
    },
  });

  useEffect(() => {
    if (isDragging) {
      dragOccurredRef.current = true;
    }
  }, [isDragging]);

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40",
        disabled && "opacity-60",
      )}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (disabled) return;
        if (dragOccurredRef.current) {
          dragOccurredRef.current = false;
          return;
        }
        onOpen(ticket.id);
      }}
    >
      <TicketCard ticket={ticket} showStatus={false} className="rounded-md p-3" />
    </div>
  );
}

export function TicketBoardCardContent({
  ticket,
  className,
}: {
  ticket: Ticket;
  className?: string;
}) {
  return (
    <TicketCard ticket={ticket} showStatus={false} className={cn("rounded-md p-3", className)} />
  );
}
