import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon } from "@hugeicons/core-free-icons";

import { useAssigneesQuery } from "@/entities/assignee";
import { useStatusesQuery } from "@/entities/status";
import { useTagsQuery } from "@/entities/tag";
import {
  formatTicketCreatedAt,
  fromDatetimeLocalValue,
  PriorityBadge,
  StatusBadge,
  TICKET_PRIORITY_OPTIONS,
  TicketDeadline,
  TicketTags,
  toDatetimeLocalValue,
  useUpdateTicketMutation,
  type Ticket,
  type TicketPriority,
} from "@/entities/ticket";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { TagMultiSelect } from "@/shared/ui/tag-multi-select";
import { toast } from "@/shared/ui/toast";
import { UserAvatar } from "@/shared/ui/user-avatar";

export type TicketDetailsActionsState = {
  isDirty: boolean;
  isPending: boolean;
  formError: string | null;
  save: () => void;
};

type EditableField = "status" | "priority" | "deadline" | "assignee" | "tags";

const ALL_FIELDS: EditableField[] = ["status", "priority", "deadline", "assignee", "tags"];

const priorityItems = TICKET_PRIORITY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

function sameTagIds(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);
  return left.every((id, index) => id === right[index]);
}

type TicketDetailsPanelProps = {
  ticket: Ticket;
  onActionsStateChange?: (state: TicketDetailsActionsState) => void;
};

export function TicketDetailsPanel({ ticket, onActionsStateChange }: TicketDetailsPanelProps) {
  const assigneesQuery = useAssigneesQuery();
  const statusesQuery = useStatusesQuery(true);
  const tagsQuery = useTagsQuery();
  const updateMutation = useUpdateTicketMutation();

  const [editing, setEditing] = useState<Set<EditableField>>(new Set());
  const [statusId, setStatusId] = useState(String(ticket.status.id));
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [deadlineLocal, setDeadlineLocal] = useState(toDatetimeLocalValue(ticket.deadline));
  const [assigneeId, setAssigneeId] = useState(
    ticket.assignee ? String(ticket.assignee.id) : "none",
  );
  const [tagIds, setTagIds] = useState(() => ticket.tags.map((tag) => tag.id));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setEditing(new Set());
    setStatusId(String(ticket.status.id));
    setPriority(ticket.priority);
    setDeadlineLocal(toDatetimeLocalValue(ticket.deadline));
    setAssigneeId(ticket.assignee ? String(ticket.assignee.id) : "none");
    setTagIds(ticket.tags.map((tag) => tag.id));
    setFormError(null);
  }, [ticket]);

  const isDirty =
    statusId !== String(ticket.status.id) ||
    priority !== ticket.priority ||
    deadlineLocal !== toDatetimeLocalValue(ticket.deadline) ||
    assigneeId !== (ticket.assignee ? String(ticket.assignee.id) : "none") ||
    !sameTagIds(
      tagIds,
      ticket.tags.map((tag) => tag.id),
    );

  const saveRef = useRef(() => {});
  saveRef.current = () => {
    void (async () => {
      setFormError(null);
      try {
        await updateMutation.mutateAsync({
          ticketId: ticket.id,
          input: {
            statusId: Number(statusId),
            priority,
            deadline: fromDatetimeLocalValue(deadlineLocal),
            assigneeId: assigneeId === "none" ? null : Number(assigneeId),
            tagIds,
          },
        });
        setEditing(new Set());
        toast.success({ title: "Ticket updated" });
      } catch (error) {
        setFormError(isApiError(error) ? error.message : "Could not update ticket");
      }
    })();
  };

  useEffect(() => {
    onActionsStateChange?.({
      isDirty,
      isPending: updateMutation.isPending,
      formError,
      save: () => {
        saveRef.current();
      },
    });
  }, [formError, isDirty, onActionsStateChange, updateMutation.isPending]);

  const statusItems = useMemo(() => {
    const statuses = statusesQuery.data ?? [];
    const items = statuses.map((status) => ({
      value: String(status.id),
      label: status.name,
    }));
    if (!items.some((item) => item.value === String(ticket.status.id))) {
      items.unshift({ value: String(ticket.status.id), label: ticket.status.name });
    }
    return items;
  }, [statusesQuery.data, ticket.status.id, ticket.status.name]);

  const assigneeItems = [
    { value: "none", label: "Unassigned" },
    ...(assigneesQuery.data ?? []).map((assignee) => ({
      value: String(assignee.id),
      label: assignee.name,
    })),
  ];

  function startEdit(field: EditableField) {
    setEditing((current) => new Set(current).add(field));
  }

  function editAll() {
    setEditing(new Set(ALL_FIELDS));
  }

  const isEditing = (field: EditableField) => editing.has(field);

  const displayAssignee =
    assigneeId === "none"
      ? null
      : (assigneesQuery.data?.find((assignee) => String(assignee.id) === assigneeId) ??
        (ticket.assignee && String(ticket.assignee.id) === assigneeId ? ticket.assignee : null));

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-xs text-muted-foreground">{ticket.code}</p>
          <Button type="button" variant="outline" size="sm" onClick={editAll}>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
            Edit
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h2 className="min-w-0 flex-1 text-xl font-semibold tracking-tight text-balance">
            {ticket.title}
          </h2>
          {isEditing("priority") ? (
            <Select
              items={priorityItems}
              value={priority}
              onValueChange={(value) => {
                if (value !== null) setPriority(value as TicketPriority);
              }}
            >
              <SelectTrigger className="w-32" aria-label="Priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-1">
              <PriorityBadge priority={priority} />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label="Edit priority"
                onClick={() => startEdit("priority")}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              </Button>
            </div>
          )}
        </div>

        <time className="block text-xs text-muted-foreground">
          Created {formatTicketCreatedAt(ticket.createdAt)}
        </time>

        <EditableRow
          label="Status"
          editing={isEditing("status")}
          onEdit={() => startEdit("status")}
        >
          {isEditing("status") ? (
            <Select
              items={statusItems}
              value={statusId}
              onValueChange={(value) => {
                if (value !== null) setStatusId(value);
              }}
              disabled={statusesQuery.isPending}
            >
              <SelectTrigger className="w-full" aria-label="Status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <StatusBadge
              status={
                statusesQuery.data?.find((status) => String(status.id) === statusId) ??
                ticket.status
              }
            />
          )}
        </EditableRow>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-medium">Description</h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {ticket.description}
        </p>
      </section>

      <Separator />

      <section className="space-y-3">
        <h3 className="text-sm font-medium">Customer</h3>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{ticket.customerName}</p>
          <a href={`mailto:${ticket.customerEmail}`} className="text-primary hover:underline">
            {ticket.customerEmail}
          </a>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <EditableRow
          label="Assignee"
          editing={isEditing("assignee")}
          onEdit={() => startEdit("assignee")}
        >
          {isEditing("assignee") ? (
            <Select
              items={assigneeItems}
              value={assigneeId}
              onValueChange={(value) => {
                if (value !== null) setAssigneeId(value);
              }}
            >
              <SelectTrigger className="w-full" aria-label="Assignee">
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assigneeItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : displayAssignee ? (
            <div className="flex items-center gap-2">
              <UserAvatar name={displayAssignee.name} size="sm" />
              <div className="text-sm">
                <p className="font-medium">{displayAssignee.name}</p>
                <p className="text-muted-foreground">
                  {[displayAssignee.department, displayAssignee.position]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Unassigned</p>
          )}
        </EditableRow>

        <EditableRow
          label="Deadline"
          editing={isEditing("deadline")}
          onEdit={() => startEdit("deadline")}
        >
          {isEditing("deadline") ? (
            <Input
              type="datetime-local"
              value={deadlineLocal}
              onChange={(event) => setDeadlineLocal(event.target.value)}
            />
          ) : (
            <TicketDeadline
              deadline={fromDatetimeLocalValue(deadlineLocal) ?? ticket.deadline}
              className="text-sm"
            />
          )}
        </EditableRow>

        <EditableRow label="Tags" editing={isEditing("tags")} onEdit={() => startEdit("tags")}>
          {isEditing("tags") ? (
            <TagMultiSelect
              tags={tagsQuery.data ?? []}
              value={tagIds}
              onChange={setTagIds}
              disabled={updateMutation.isPending}
              placeholder="Select tags"
            />
          ) : (
            <TicketTags
              tags={
                tagIds.length === 0
                  ? []
                  : (tagsQuery.data ?? ticket.tags).filter((tag) => tagIds.includes(tag.id))
              }
            />
          )}
        </EditableRow>
      </section>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
    </div>
  );
}

function EditableRow({
  label,
  editing,
  onEdit,
  children,
}: {
  label: string;
  editing: boolean;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm font-medium">{label}</Label>
        {!editing ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${label.toLowerCase()}`}
            onClick={onEdit}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
          </Button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
