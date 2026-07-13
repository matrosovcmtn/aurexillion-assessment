import { useMemo } from "react";

import { useStatusesQuery, type Status } from "@/entities/status";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

import { useUpdateTicketStatus } from "../model/use-update-ticket-status";

type TicketStatusSelectProps = {
  ticketId: number;
  status: Status;
  id?: string;
  label?: string;
  className?: string;
};

export function TicketStatusSelect({
  ticketId,
  status,
  id,
  label,
  className,
}: TicketStatusSelectProps) {
  const { updateStatus, pendingTicketId } = useUpdateTicketStatus();
  const statusesQuery = useStatusesQuery(true);
  const isPending = pendingTicketId === ticketId;
  const selectId = id ?? `ticket-status-${ticketId}`;

  const statusItems = useMemo(() => {
    const statuses = statusesQuery.data ?? [];
    const items = statuses.map((item) => ({
      value: String(item.id),
      label: item.name,
    }));

    if (!items.some((item) => item.value === String(status.id))) {
      items.unshift({ value: String(status.id), label: status.name });
    }

    return items;
  }, [status.id, status.name, statusesQuery.data]);

  return (
    <div className={className}>
      {label ? (
        <Label htmlFor={selectId} className="mb-1.5 block">
          {label}
        </Label>
      ) : (
        <Label htmlFor={selectId} className="sr-only">
          Status
        </Label>
      )}
      <Select
        items={statusItems}
        value={String(status.id)}
        disabled={isPending || statusesQuery.isPending}
        onValueChange={(value) => {
          if (value === null || value === String(status.id)) return;
          void updateStatus(ticketId, Number(value));
        }}
      >
        <SelectTrigger id={selectId} className="w-full" disabled={isPending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
