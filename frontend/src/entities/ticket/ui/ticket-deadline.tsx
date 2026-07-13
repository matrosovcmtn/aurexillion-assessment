import {
  formatTicketCreatedAt,
  formatTicketDeadline,
  isDeadlineDueOrPast,
} from "@/entities/ticket";
import { cn } from "@/shared/lib/cn";

type TicketDeadlineProps = {
  deadline: string | null | undefined;
  className?: string;
};

export function TicketDeadline({ deadline, className }: TicketDeadlineProps) {
  if (!deadline) {
    return <span className={cn("text-muted-foreground", className)}>No deadline</span>;
  }

  return (
    <time
      dateTime={deadline}
      className={cn(
        isDeadlineDueOrPast(deadline) ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      {formatTicketDeadline(deadline)}
    </time>
  );
}

type TicketCreatedAtProps = {
  createdAt: string;
  className?: string;
};

export function TicketCreatedAt({ createdAt, className }: TicketCreatedAtProps) {
  return (
    <time dateTime={createdAt} className={cn("text-muted-foreground", className)}>
      {formatTicketCreatedAt(createdAt)}
    </time>
  );
}
