import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

import { formatTicketPriority } from "../model/formatters";
import type { TicketPriority } from "../model/types";

const priorityClassName: Record<TicketPriority, string> = {
  low: "border-transparent bg-muted text-muted-foreground",
  medium: "border-transparent bg-orange-100 text-orange-900",
  high: "border-transparent bg-red-100 text-red-800",
};

type PriorityBadgeProps = {
  priority: TicketPriority;
  className?: string;
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(priorityClassName[priority], className)}>
      {formatTicketPriority(priority)}
    </Badge>
  );
}
