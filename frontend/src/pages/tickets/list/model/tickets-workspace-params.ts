import {
  isTicketPriority,
  parsePositiveInt,
  type TicketFilters,
  type TicketPriority,
  type TicketSortDirection,
  type TicketSortField,
} from "@/entities/ticket";

export type TicketsView = "list" | "board";

export type TicketsWorkspaceParams = {
  view: TicketsView;
  filters: TicketFilters;
};

const DEFAULT_SORT = "createdAt,desc" as const;
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];

function parseSort(value: string | null): TicketFilters["sort"] {
  if (!value) return DEFAULT_SORT;
  const [field, direction] = value.split(",");
  if (
    (field === "createdAt" || field === "deadline") &&
    (direction === "asc" || direction === "desc")
  ) {
    return `${field},${direction}` as `${TicketSortField},${TicketSortDirection}`;
  }
  return DEFAULT_SORT;
}

function parseIdList(value: string | null): number[] | undefined {
  if (!value) return undefined;
  const ids = value
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);
  return ids.length > 0 ? ids : undefined;
}

function parsePriorities(value: string | null): TicketPriority[] | undefined {
  if (!value) return undefined;
  const priorities = value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is TicketPriority => isTicketPriority(part));
  return priorities.length > 0 ? priorities : undefined;
}

function parsePageSize(value: string | null): number {
  if (value === null) return DEFAULT_PAGE_SIZE;
  const size = Number(value);
  if (!Number.isInteger(size)) return DEFAULT_PAGE_SIZE;
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE;
}

export function parseTicketsView(value: string | null): TicketsView {
  return value === "board" ? "board" : "list";
}

export function parseTicketsWorkspaceParams(searchParams: URLSearchParams): TicketsWorkspaceParams {
  const statusId = parsePositiveInt(searchParams.get("statusId"));
  const assigneeIds = parseIdList(searchParams.get("assigneeIds"));
  const priorities = parsePriorities(searchParams.get("priority"));
  const q = searchParams.get("q")?.trim() || undefined;
  const code = searchParams.get("code")?.trim() || undefined;
  const tagIds = parseIdList(searchParams.get("tagIds"));
  const pageParam = searchParams.get("page");
  const page =
    pageParam !== null && Number.isInteger(Number(pageParam)) && Number(pageParam) >= 0
      ? Number(pageParam)
      : 0;

  const filters: TicketFilters = {
    page,
    size: parsePageSize(searchParams.get("size")),
    sort: parseSort(searchParams.get("sort")),
  };

  if (statusId !== undefined) filters.statusId = statusId;
  if (assigneeIds) filters.assigneeIds = assigneeIds;
  if (priorities) filters.priorities = priorities;
  if (q) filters.q = q;
  if (code) filters.code = code;
  if (tagIds) filters.tagIds = tagIds;

  return {
    view: parseTicketsView(searchParams.get("view")),
    filters,
  };
}

export type BuildTicketsSearchParamsInput = {
  view: TicketsView;
  statusId?: number | "all";
  priorities?: TicketPriority[];
  assigneeIds?: number[];
  q?: string;
  code?: string;
  tagIds?: number[];
  page?: number;
  size?: number;
  sort?: TicketFilters["sort"];
};

export function buildTicketsSearchParams(params: BuildTicketsSearchParamsInput): URLSearchParams {
  const next = new URLSearchParams();
  next.set("view", params.view);

  if (params.statusId && params.statusId !== "all") {
    next.set("statusId", String(params.statusId));
  }
  if (params.priorities?.length) {
    next.set("priority", params.priorities.join(","));
  }
  if (params.assigneeIds?.length) {
    next.set("assigneeIds", params.assigneeIds.join(","));
  }
  if (params.q?.trim()) {
    next.set("q", params.q.trim());
  }
  if (params.code?.trim()) {
    next.set("code", params.code.trim());
  }
  if (params.tagIds?.length) {
    next.set("tagIds", params.tagIds.join(","));
  }
  if (params.page && params.page > 0) {
    next.set("page", String(params.page));
  }
  if (params.size && params.size !== DEFAULT_PAGE_SIZE) {
    next.set("size", String(params.size));
  }
  if (params.sort && params.sort !== DEFAULT_SORT) {
    next.set("sort", params.sort);
  }

  return next;
}

export function hasActiveTicketFilters(filters: TicketFilters): boolean {
  return Boolean(
    filters.statusId ||
    (filters.priorities && filters.priorities.length > 0) ||
    (filters.assigneeIds && filters.assigneeIds.length > 0) ||
    filters.q ||
    filters.code ||
    (filters.tagIds && filters.tagIds.length > 0),
  );
}
