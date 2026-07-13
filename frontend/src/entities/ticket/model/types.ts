import type { Assignee } from "@/entities/assignee";
import type { Status } from "@/entities/status";
import type { Tag } from "@/entities/tag";

export type TicketPriority = "low" | "medium" | "high";

export type Ticket = {
  id: number;
  code: string;
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  status: Status;
  priority: TicketPriority;
  deadline: string | null;
  assignee: Assignee | null;
  tags: Tag[];
  createdAt: string;
};

export type TicketSortField = "createdAt" | "deadline";
export type TicketSortDirection = "asc" | "desc";

export type TicketListParams = {
  page?: number;
  size?: number;
  sort?: `${TicketSortField},${TicketSortDirection}`;
  q?: string;
  statusId?: number;
  priorities?: TicketPriority[];
  tagIds?: number[];
  assigneeIds?: number[];
  code?: string;
};

export type TicketFilters = {
  statusId?: number;
  priorities?: TicketPriority[];
  q?: string;
  code?: string;
  tagIds?: number[];
  assigneeIds?: number[];
  page?: number;
  size?: number;
  sort?: TicketListParams["sort"];
};

export type CreateTicketInput = {
  title: string;
  description: string;
  customerName: string;
  customerEmail: string;
  priority: TicketPriority;
  deadline?: string | null;
  assigneeId?: number | null;
  tagIds?: number[];
};

export type UpdateTicketInput = {
  statusId?: number;
  priority?: TicketPriority;
  deadline?: string | null;
  assigneeId?: number | null;
  tagIds?: number[];
};

export type UpdateTicketStatusInput = {
  statusId: number;
};
