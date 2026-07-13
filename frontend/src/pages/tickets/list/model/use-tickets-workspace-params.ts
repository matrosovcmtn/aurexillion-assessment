import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

import { parsePositiveInt, type TicketFilters, type TicketPriority } from "@/entities/ticket";

import {
  buildTicketsSearchParams,
  parseTicketsWorkspaceParams,
  type TicketsView,
} from "./tickets-workspace-params";

function withTicketParam(params: URLSearchParams, ticketId: number | null): URLSearchParams {
  if (ticketId !== null) {
    params.set("ticket", String(ticketId));
  } else {
    params.delete("ticket");
  }
  return params;
}

export function useTicketsWorkspaceParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { view, filters } = useMemo(
    () => parseTicketsWorkspaceParams(searchParams),
    [searchParams],
  );

  const ticketId = useMemo(
    () => parsePositiveInt(searchParams.get("ticket")) ?? null,
    [searchParams],
  );

  const setWorkspaceParams = useCallback(
    (next: {
      view?: TicketsView;
      statusId?: number | "all";
      priorities?: TicketPriority[];
      assigneeIds?: number[];
      q?: string;
      code?: string;
      tagIds?: number[];
      page?: number;
      size?: number;
      sort?: TicketFilters["sort"];
      resetPage?: boolean;
      ticketId?: number | null;
    }) => {
      const current = parseTicketsWorkspaceParams(searchParams);
      const page =
        next.page !== undefined ? next.page : next.resetPage ? 0 : (current.filters.page ?? 0);
      const nextTicketId = next.ticketId !== undefined ? next.ticketId : ticketId;

      setSearchParams(
        withTicketParam(
          buildTicketsSearchParams({
            view: next.view ?? current.view,
            statusId: next.statusId ?? current.filters.statusId ?? "all",
            priorities:
              next.priorities !== undefined ? next.priorities : (current.filters.priorities ?? []),
            assigneeIds:
              next.assigneeIds !== undefined
                ? next.assigneeIds
                : (current.filters.assigneeIds ?? []),
            q: next.q !== undefined ? next.q : (current.filters.q ?? ""),
            code: next.code !== undefined ? next.code : (current.filters.code ?? ""),
            tagIds: next.tagIds !== undefined ? next.tagIds : (current.filters.tagIds ?? []),
            page,
            size: next.size !== undefined ? next.size : (current.filters.size ?? 20),
            sort: next.sort ?? current.filters.sort,
          }),
          nextTicketId,
        ),
        { replace: true },
      );
    },
    [searchParams, setSearchParams, ticketId],
  );

  const clearFilters = useCallback(() => {
    setSearchParams(
      withTicketParam(
        buildTicketsSearchParams({
          view,
          statusId: "all",
          priorities: [],
          assigneeIds: [],
          q: "",
          code: "",
          tagIds: [],
          page: 0,
          size: filters.size,
          sort: filters.sort,
        }),
        ticketId,
      ),
      { replace: true },
    );
  }, [filters.size, filters.sort, setSearchParams, ticketId, view]);

  return {
    view,
    filters,
    ticketId,
    openTicket: (id: number) => setWorkspaceParams({ ticketId: id }),
    closeTicket: () => setWorkspaceParams({ ticketId: null }),
    setView: (nextView: TicketsView) => setWorkspaceParams({ view: nextView, resetPage: true }),
    setStatusId: (statusId: number | "all") => setWorkspaceParams({ statusId, resetPage: true }),
    setPriorities: (priorities: TicketPriority[]) =>
      setWorkspaceParams({ priorities, resetPage: true }),
    setAssigneeIds: (assigneeIds: number[]) => setWorkspaceParams({ assigneeIds, resetPage: true }),
    setQ: (q: string) => setWorkspaceParams({ q, resetPage: true }),
    setCode: (code: string) => setWorkspaceParams({ code, resetPage: true }),
    setTagIds: (tagIds: number[]) => setWorkspaceParams({ tagIds, resetPage: true }),
    setPage: (page: number) => setWorkspaceParams({ page }),
    setSize: (size: number) => setWorkspaceParams({ size, resetPage: true }),
    setSort: (sort: TicketFilters["sort"]) => setWorkspaceParams({ sort, resetPage: true }),
    clearFilters,
  };
}
