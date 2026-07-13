import { HugeiconsIcon } from "@hugeicons/react";
import { CleanIcon, FilterIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { useTicketsQuery } from "@/entities/ticket";
import { hasActiveTicketFilters } from "@/pages/tickets/list/model/tickets-workspace-params";
import { useTicketsWorkspaceParams } from "@/pages/tickets/list/model/use-tickets-workspace-params";
import { isApiError } from "@/shared/api";
import { MEDIA_SM_UP, useMediaQuery } from "@/shared/lib/use-media-query";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";
import { TicketFilters } from "@/widgets/ticket-filters";
import { TicketDetailsSheet } from "@/widgets/ticket-details";
import { TicketsBoard, TicketsBoardSkeleton } from "@/widgets/tickets-board";
import { TicketsEmptyState, TicketsTable, TicketsTableSkeleton } from "@/widgets/tickets-table";

import { TicketsPagination } from "./tickets-pagination";

export function TicketsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useMediaQuery(MEDIA_SM_UP);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    view,
    filters,
    ticketId,
    openTicket,
    closeTicket,
    setStatusId,
    setPriorities,
    setAssigneeIds,
    setQ,
    setCode,
    setTagIds,
    setSort,
    setPage,
    setSize,
    clearFilters,
  } = useTicketsWorkspaceParams();

  const queryFilters =
    view === "board"
      ? {
          ...filters,
          statusId: undefined,
          page: 0,
          size: 100,
          sort: filters.sort,
        }
      : filters;

  const ticketsQuery = useTicketsQuery(queryFilters);
  const filtersActive = hasActiveTicketFilters(filters);
  const showStatusFilter = view === "list";
  const tickets = ticketsQuery.data?.content ?? [];
  const page = ticketsQuery.data?.number ?? filters.page ?? 0;
  const size = ticketsQuery.data?.size ?? filters.size ?? 20;
  const totalPages = ticketsQuery.data?.totalPages ?? 0;
  const totalElements = ticketsQuery.data?.totalElements ?? 0;

  useEffect(() => {
    if (!searchParams.get("view")) {
      const next = new URLSearchParams(searchParams);
      next.set("view", "list");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const errorMessage = ticketsQuery.error
    ? isApiError(ticketsQuery.error)
      ? ticketsQuery.error.message
      : "Something went wrong while loading tickets"
    : null;

  const filtersProps = {
    statusId: filters.statusId,
    priorities: filters.priorities,
    assigneeIds: filters.assigneeIds,
    q: filters.q,
    code: filters.code,
    tagIds: filters.tagIds,
    sort: filters.sort,
    onStatusChange: setStatusId,
    onPrioritiesChange: setPriorities,
    onAssigneeIdsChange: setAssigneeIds,
    onQChange: setQ,
    onCodeChange: setCode,
    onTagIdsChange: setTagIds,
    onSortChange: setSort,
    showStatusFilter,
    showSort: view === "list",
  } as const;

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="shrink-0 text-sm text-muted-foreground">
        Review open work in a list or board, then open a ticket for details
      </p>

      <div className="shrink-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm leading-6 font-medium tracking-tight">Filters</h2>
          {filtersActive ? (
            <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
              <HugeiconsIcon icon={CleanIcon} strokeWidth={2} />
              Clear filters
            </Button>
          ) : null}
          {!isDesktop ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={() => setFiltersOpen(true)}
            >
              <HugeiconsIcon icon={FilterIcon} strokeWidth={2} />
              Filters
              {filtersActive ? (
                <span className="rounded-full bg-primary px-1.5 text-[0.625rem] text-primary-foreground">
                  On
                </span>
              ) : null}
            </Button>
          ) : null}
        </div>

        {isDesktop ? <TicketFilters {...filtersProps} /> : null}

        {!isDesktop ? (
          <ResponsiveDialog
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filters"
            description="Narrow the ticket list by search, status, priority, and more"
          >
            <TicketFilters {...filtersProps} />
          </ResponsiveDialog>
        ) : null}
      </div>

      {ticketsQuery.isPending ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          {view === "board" ? <TicketsBoardSkeleton /> : <TicketsTableSkeleton />}
        </div>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" className="shrink-0">
          <AlertTitle>Could not load tickets</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            <span>{errorMessage}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void ticketsQuery.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {ticketsQuery.isSuccess && tickets.length === 0 ? (
        <div className="min-h-0 flex-1">
          <TicketsEmptyState hasFilters={filtersActive} onClearFilters={clearFilters} />
        </div>
      ) : null}

      {ticketsQuery.isSuccess && tickets.length > 0 ? (
        <div
          className={
            ticketsQuery.isFetching
              ? "flex min-h-0 flex-1 flex-col gap-3 opacity-80 transition-opacity"
              : "flex min-h-0 flex-1 flex-col gap-3"
          }
        >
          {view === "board" ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <TicketsBoard tickets={tickets} onTicketOpen={openTicket} />
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">
                <TicketsTable tickets={tickets} onTicketOpen={openTicket} />
              </div>
              <div className="shrink-0 border-t border-border pt-3">
                <TicketsPagination
                  page={page}
                  size={size}
                  totalPages={totalPages}
                  totalElements={totalElements}
                  onPageChange={setPage}
                  onSizeChange={setSize}
                />
              </div>
            </>
          )}
        </div>
      ) : null}

      <TicketDetailsSheet
        ticketId={ticketId}
        open={ticketId !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            closeTicket();
          }
        }}
      />
    </section>
  );
}
