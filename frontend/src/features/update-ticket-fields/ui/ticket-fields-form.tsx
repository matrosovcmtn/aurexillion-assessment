import { useEffect, useRef, useState } from "react";

import { useAssigneesQuery } from "@/entities/assignee";
import { useTagsQuery } from "@/entities/tag";
import {
  fromDatetimeLocalValue,
  TICKET_PRIORITY_OPTIONS,
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
import { TagMultiSelect } from "@/shared/ui/tag-multi-select";
import { toast } from "@/shared/ui/toast";

export type TicketFieldsActionsState = {
  isDirty: boolean;
  isPending: boolean;
  formError: string | null;
  save: () => void;
};

type TicketFieldsFormProps = {
  ticket: Ticket;
  hideActions?: boolean;
  onActionsStateChange?: (state: TicketFieldsActionsState) => void;
};

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

export function TicketFieldsForm({
  ticket,
  hideActions = false,
  onActionsStateChange,
}: TicketFieldsFormProps) {
  const assigneesQuery = useAssigneesQuery();
  const tagsQuery = useTagsQuery();
  const updateMutation = useUpdateTicketMutation();

  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [deadlineLocal, setDeadlineLocal] = useState(toDatetimeLocalValue(ticket.deadline));
  const [assigneeId, setAssigneeId] = useState(
    ticket.assignee ? String(ticket.assignee.id) : "none",
  );
  const [tagIds, setTagIds] = useState(() => ticket.tags.map((tag) => tag.id));
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setPriority(ticket.priority);
    setDeadlineLocal(toDatetimeLocalValue(ticket.deadline));
    setAssigneeId(ticket.assignee ? String(ticket.assignee.id) : "none");
    setTagIds(ticket.tags.map((tag) => tag.id));
    setFormError(null);
  }, [ticket]);

  const isDirty =
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
            priority,
            deadline: fromDatetimeLocalValue(deadlineLocal),
            assigneeId: assigneeId === "none" ? null : Number(assigneeId),
            tagIds,
          },
        });
        toast.success({ title: "Ticket updated" });
      } catch (error) {
        setFormError(isApiError(error) ? error.message : "Could not update ticket.");
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

  const assigneeItems = [
    { value: "none", label: "Unassigned" },
    ...(assigneesQuery.data ?? []).map((assignee) => ({
      value: String(assignee.id),
      label: assignee.name,
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ticket-priority">Priority</Label>
        <Select
          items={priorityItems}
          value={priority}
          onValueChange={(value) => {
            if (value !== null) setPriority(value as TicketPriority);
          }}
        >
          <SelectTrigger id="ticket-priority" className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-deadline">Deadline</Label>
        <Input
          id="ticket-deadline"
          type="datetime-local"
          value={deadlineLocal}
          onChange={(event) => setDeadlineLocal(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-assignee">Assignee</Label>
        <Select
          items={assigneeItems}
          value={assigneeId}
          onValueChange={(value) => {
            if (value !== null) setAssigneeId(value);
          }}
        >
          <SelectTrigger id="ticket-assignee" className="w-full">
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
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ticket-tags">Tags</Label>
        <TagMultiSelect
          id="ticket-tags"
          tags={tagsQuery.data ?? []}
          value={tagIds}
          onChange={setTagIds}
          disabled={updateMutation.isPending}
          placeholder="Select tags"
        />
      </div>

      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

      {!hideActions ? (
        <Button
          type="button"
          disabled={!isDirty || updateMutation.isPending}
          onClick={() => {
            saveRef.current();
          }}
        >
          {updateMutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      ) : null}
    </div>
  );
}
