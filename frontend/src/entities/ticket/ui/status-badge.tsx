import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/cn";

import type { Status } from "@/entities/status";

type StatusBadgeProps = {
  status: Status;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", className)}
      style={{
        backgroundColor: `${status.color}22`,
        color: status.color,
      }}
    >
      {status.name}
    </Badge>
  );
}
