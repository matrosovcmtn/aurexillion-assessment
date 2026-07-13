import {
  PriorityBadge,
  StatusBadge,
  TicketCard,
  TicketCreatedAt,
  TicketDeadline,
  TicketTags,
  type Ticket,
} from "@/entities/ticket";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { UserAvatar } from "@/shared/ui/user-avatar";

type TicketsTableProps = {
  tickets: Ticket[];
  onTicketOpen: (ticketId: number) => void;
};

export function TicketsTable({ tickets, onTicketOpen }: TicketsTableProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="hidden h-full min-h-0 overflow-auto md:block">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background [&_tr]:border-b">
            <TableRow className="hover:bg-transparent">
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                tabIndex={0}
                className="cursor-pointer transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                onClick={() => onTicketOpen(ticket.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onTicketOpen(ticket.id);
                  }
                }}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {ticket.code}
                </TableCell>
                <TableCell className="max-w-56 font-medium whitespace-normal">
                  {ticket.title}
                </TableCell>
                <TableCell className="max-w-40 truncate">{ticket.customerName}</TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <TicketCreatedAt createdAt={ticket.createdAt} className="text-sm" />
                </TableCell>
                <TableCell>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <UserAvatar name={ticket.assignee.name} size="sm" />
                      <span className="text-sm">{ticket.assignee.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <TicketDeadline deadline={ticket.deadline} className="text-sm" />
                </TableCell>
                <TableCell>
                  <TicketTags tags={ticket.tags} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="grid h-full min-h-0 content-start gap-3 overflow-auto md:hidden">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onTicketOpen(ticket.id)}
              className={cn(
                "h-auto w-full justify-start p-0 text-left whitespace-normal hover:bg-transparent",
              )}
            >
              <TicketCard ticket={ticket} className="w-full" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
