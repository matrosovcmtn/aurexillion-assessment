import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

import { useDeleteTicketMutation, useTicketQuery } from "@/entities/ticket";
import { isApiError } from "@/shared/api";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/sheet";
import { toast } from "@/shared/ui/toast";

import { TicketDetailsPanel, type TicketDetailsActionsState } from "./ticket-details-panel";
import { TicketDetailsSkeleton } from "./ticket-details-skeleton";

type TicketDetailsSheetProps = {
  ticketId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TicketDetailsSheet({ ticketId, open, onOpenChange }: TicketDetailsSheetProps) {
  const ticketQuery = useTicketQuery(ticketId ?? 0, open && ticketId !== null);
  const deleteMutation = useDeleteTicketMutation();
  const [actions, setActions] = useState<TicketDetailsActionsState | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const onActionsStateChange = useCallback((state: TicketDetailsActionsState) => {
    setActions(state);
  }, []);

  useEffect(() => {
    setActions(null);
    setConfirmDeleteOpen(false);
    setDeleteError(null);
  }, [ticketId]);

  async function handleDelete() {
    if (ticketId === null) return;

    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(ticketId);
      setConfirmDeleteOpen(false);
      toast.success({ title: "Ticket deleted" });
      onOpenChange(false);
    } catch (error) {
      setDeleteError(isApiError(error) ? error.message : "Could not delete ticket.");
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl"
        >
          <SheetHeader className="shrink-0 border-b border-border">
            <SheetTitle>Ticket details</SheetTitle>
            <SheetDescription>
              {ticketQuery.data?.code ?? "Review and update this support request"}
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-popover p-6">
            {ticketQuery.isPending ? <TicketDetailsSkeleton /> : null}

            {ticketQuery.isError ? (
              <Alert variant="destructive">
                <AlertTitle>
                  {isApiError(ticketQuery.error) && ticketQuery.error.status === 404
                    ? "Ticket not found"
                    : "Could not load ticket"}
                </AlertTitle>
                <AlertDescription className="flex flex-col items-start gap-3">
                  <span>
                    {isApiError(ticketQuery.error)
                      ? ticketQuery.error.message
                      : "Something went wrong while loading this ticket"}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void ticketQuery.refetch()}
                  >
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            ) : null}

            {ticketQuery.data ? (
              <TicketDetailsPanel
                ticket={ticketQuery.data}
                onActionsStateChange={onActionsStateChange}
              />
            ) : null}
          </div>

          {ticketQuery.data ? (
            <SheetFooter className="shrink-0 flex-row items-center justify-between border-t border-border">
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                aria-label="Delete ticket"
                onClick={() => setConfirmDeleteOpen(true)}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              </Button>
              <Button
                type="button"
                disabled={!actions?.isDirty || actions.isPending}
                onClick={() => actions?.save()}
              >
                {actions?.isPending ? "Saving…" : "Save changes"}
              </Button>
            </SheetFooter>
          ) : null}
        </SheetContent>
      </Sheet>

      <ResponsiveDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Delete this ticket?"
        description={
          ticketQuery.data ? `${ticketQuery.data.code} — ${ticketQuery.data.title}` : undefined
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This permanently removes the ticket. There is no undo.
          </p>
          {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setConfirmDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete ticket"}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </>
  );
}
