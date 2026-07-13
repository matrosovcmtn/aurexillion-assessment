import { useAssigneesQuery } from "@/entities/assignee";
import { useStatusesQuery, type Status } from "@/entities/status";
import { useTagsQuery } from "@/entities/tag";
import {
  TICKET_PRIORITY_OPTIONS,
  type TicketFilters,
  type TicketPriority,
} from "@/entities/ticket";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { MultiSelect } from "@/shared/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { TagMultiSelect } from "@/shared/ui/tag-multi-select";
import { useEffect, useState } from "react";

type TicketFiltersProps = {
  statusId?: number;
  priorities?: TicketPriority[];
  assigneeIds?: number[];
  q?: string;
  code?: string;
  tagIds?: number[];
  sort?: TicketFilters["sort"];
  onStatusChange: (statusId: number | "all") => void;
  onPrioritiesChange: (priorities: TicketPriority[]) => void;
  onAssigneeIdsChange: (assigneeIds: number[]) => void;
  onQChange: (q: string) => void;
  onCodeChange: (code: string) => void;
  onTagIdsChange: (tagIds: number[]) => void;
  onSortChange: (sort: TicketFilters["sort"]) => void;
  showStatusFilter?: boolean;
  showSort?: boolean;
};

const priorityOptions = TICKET_PRIORITY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

const sortItems = [
  { value: "createdAt,desc", label: "Newest created" },
  { value: "createdAt,asc", label: "Oldest created" },
  { value: "deadline,asc", label: "Due soonest" },
  { value: "deadline,desc", label: "Due latest" },
] as const;

function buildStatusItems(statuses: Status[]) {
  return [
    { value: "all", label: "All statuses" },
    ...statuses.map((status) => ({
      value: String(status.id),
      label: status.name,
    })),
  ];
}

export function TicketFilters({
  statusId,
  priorities = [],
  assigneeIds = [],
  q,
  code,
  tagIds = [],
  sort = "createdAt,desc",
  onStatusChange,
  onPrioritiesChange,
  onAssigneeIdsChange,
  onQChange,
  onCodeChange,
  onTagIdsChange,
  onSortChange,
  showStatusFilter = true,
  showSort = true,
}: TicketFiltersProps) {
  const statusesQuery = useStatusesQuery(true);
  const assigneesQuery = useAssigneesQuery();
  const tagsQuery = useTagsQuery();
  const [searchDraft, setSearchDraft] = useState(q ?? "");
  const [codeDraft, setCodeDraft] = useState(code ?? "");

  useEffect(() => {
    setSearchDraft(q ?? "");
  }, [q]);

  useEffect(() => {
    setCodeDraft(code ?? "");
  }, [code]);

  const statusItems = buildStatusItems(statusesQuery.data ?? []);
  const assigneeOptions = (assigneesQuery.data ?? []).map((assignee) => ({
    value: String(assignee.id),
    label: assignee.name,
  }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex min-w-48 flex-1 flex-col gap-1.5">
        <Label htmlFor="ticket-search">Search</Label>
        <Input
          id="ticket-search"
          value={searchDraft}
          placeholder="Title or description"
          onChange={(event) => setSearchDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onQChange(searchDraft);
            }
          }}
          onBlur={() => {
            if (searchDraft !== (q ?? "")) {
              onQChange(searchDraft);
            }
          }}
        />
      </div>

      <div className="flex min-w-36 flex-col gap-1.5">
        <Label htmlFor="ticket-code-filter">Code</Label>
        <Input
          id="ticket-code-filter"
          value={codeDraft}
          placeholder="ut-12"
          onChange={(event) => setCodeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onCodeChange(codeDraft);
            }
          }}
          onBlur={() => {
            if (codeDraft !== (code ?? "")) {
              onCodeChange(codeDraft);
            }
          }}
        />
      </div>

      {showStatusFilter ? (
        <div className="flex min-w-40 flex-col gap-1.5">
          <Label htmlFor="ticket-status-filter">Status</Label>
          <Select
            items={statusItems}
            value={statusId !== undefined ? String(statusId) : "all"}
            onValueChange={(value) => {
              if (value === null) return;
              if (value === "all") {
                onStatusChange("all");
                return;
              }
              onStatusChange(Number(value));
            }}
          >
            <SelectTrigger id="ticket-status-filter" className="w-full min-w-40">
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
      ) : null}

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label htmlFor="ticket-priority-filter">Priority</Label>
        <MultiSelect
          id="ticket-priority-filter"
          options={priorityOptions}
          value={priorities}
          onChange={(next) => onPrioritiesChange(next as TicketPriority[])}
          placeholder="All priorities"
        />
      </div>

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label htmlFor="ticket-assignee-filter">Assignee</Label>
        <MultiSelect
          id="ticket-assignee-filter"
          options={assigneeOptions}
          value={assigneeIds.map(String)}
          onChange={(next) => onAssigneeIdsChange(next.map(Number))}
          placeholder="All assignees"
        />
      </div>

      <div className="flex min-w-40 flex-col gap-1.5">
        <Label htmlFor="ticket-tags-filter">Tags</Label>
        <TagMultiSelect
          id="ticket-tags-filter"
          tags={tagsQuery.data ?? []}
          value={tagIds}
          onChange={onTagIdsChange}
          placeholder="All tags"
        />
      </div>

      {showSort ? (
        <div className="flex min-w-44 flex-col gap-1.5">
          <Label htmlFor="ticket-sort">Sort</Label>
          <Select
            items={[...sortItems]}
            value={sort}
            onValueChange={(value) => {
              if (value === null) return;
              onSortChange(value as TicketFilters["sort"]);
            }}
          >
            <SelectTrigger id="ticket-sort" className="w-full min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
