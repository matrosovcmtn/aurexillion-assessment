import { useCreateTicketDialog } from "@/features/create-ticket/ui/create-ticket-dialog";
import { Button } from "@/shared/ui/button";

type TicketsEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters?: () => void;
};

export function TicketsEmptyState({ hasFilters, onClearFilters }: TicketsEmptyStateProps) {
  const { openCreateTicket } = useCreateTicketDialog();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-4 py-10">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">No tickets match these filters</h2>
          <p className="text-sm text-muted-foreground">
            Try different filters, or clear them and start over
          </p>
        </div>
        {onClearFilters ? (
          <Button type="button" size="lg" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border px-4 py-10">
      <div className="space-y-1">
        <h2 className="text-sm font-medium">No tickets yet</h2>
        <p className="text-sm text-muted-foreground">
          Create the first support ticket to get started
        </p>
      </div>
      <Button type="button" size="lg" onClick={() => openCreateTicket()}>
        Create ticket
      </Button>
    </div>
  );
}
