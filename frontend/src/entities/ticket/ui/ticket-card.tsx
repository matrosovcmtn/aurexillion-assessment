import {
  PriorityBadge,
  StatusBadge,
  TicketCreatedAt,
  TicketDeadline,
  TicketTags,
  type Ticket,
} from "@/entities/ticket";
import { cn } from "@/shared/lib/cn";
import { UserAvatar } from "@/shared/ui/user-avatar";

type TicketCardProps = {
  ticket: Ticket;
  className?: string;
  showStatus?: boolean;
};

export function TicketCard({ ticket, className, showStatus = true }: TicketCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-border bg-card p-4 text-left shadow-xs transition-colors",
        "hover:border-foreground/15 hover:bg-muted/40",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          <p className="font-mono text-xs text-muted-foreground">{ticket.code}</p>
          <div className="flex flex-wrap items-center gap-2">
            <p className="min-w-0 flex-1 text-sm font-medium text-foreground">{ticket.title}</p>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-xs text-muted-foreground">{ticket.customerName}</p>
          <TicketCreatedAt createdAt={ticket.createdAt} className="text-xs" />
        </div>

        {showStatus ? <StatusBadge status={ticket.status} /> : null}

        {ticket.assignee ? (
          <div className="flex items-center gap-2 text-sm">
            <UserAvatar name={ticket.assignee.name} size="sm" />
            <span>{ticket.assignee.name}</span>
          </div>
        ) : null}

        <TicketTags tags={ticket.tags} />
        <TicketDeadline deadline={ticket.deadline} className="text-xs" />
      </div>
    </article>
  );
}
