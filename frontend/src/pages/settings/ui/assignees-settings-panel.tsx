import { useState } from "react";

import {
  useAssigneesQuery,
  useCreateAssigneeMutation,
  useDeleteAssigneeMutation,
  useUpdateAssigneeMutation,
  type Assignee,
  type AssigneeInput,
} from "@/entities/assignee";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";

import { assigneeFormSchema, firstZodError } from "../model/settings-form.schemas";

const emptyForm: AssigneeInput = {
  name: "",
  email: "",
  department: "",
  position: "",
};

export function AssigneesSettingsPanel() {
  const assigneesQuery = useAssigneesQuery();
  const createMutation = useCreateAssigneeMutation();
  const updateMutation = useUpdateAssigneeMutation();
  const deleteMutation = useDeleteAssigneeMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Assignee | null>(null);
  const [form, setForm] = useState<AssigneeInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(assignee: Assignee) {
    setEditing(assignee);
    setForm({
      name: assignee.name,
      email: assignee.email,
      department: assignee.department,
      position: assignee.position ?? "",
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    const parsed = assigneeFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(firstZodError(parsed.error));
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: parsed.data });
        toast.success({ title: "Assignee updated" });
      } else {
        await createMutation.mutateAsync(parsed.data);
        toast.success({ title: "Assignee created" });
      }
      setDialogOpen(false);
    } catch (error) {
      setFormError(isApiError(error) ? error.message : "Could not save assignee.");
    }
  }

  async function handleDelete(assignee: Assignee) {
    try {
      await deleteMutation.mutateAsync(assignee.id);
      toast.success({ title: "Assignee deleted" });
    } catch (error) {
      toast.error({
        title: "Delete failed",
        description: isApiError(error) ? error.message : "Could not delete assignee.",
      });
    }
  }

  const assignees = assigneesQuery.data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">People who can own tickets</p>
        <Button type="button" size="sm" onClick={openCreate}>
          Add assignee
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignees.map((assignee) => (
              <TableRow key={assignee.id}>
                <TableCell className="font-medium">{assignee.name}</TableCell>
                <TableCell>{assignee.email}</TableCell>
                <TableCell>{assignee.department}</TableCell>
                <TableCell>{assignee.position ?? "—"}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(assignee)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(assignee)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ResponsiveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit assignee" : "Add assignee"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="assignee-name">Name</Label>
            <Input
              id="assignee-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Maya Chen"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignee-email">Email</Label>
            <Input
              id="assignee-email"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              placeholder="maya.chen@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignee-department">Department</Label>
            <Input
              id="assignee-department"
              value={form.department}
              onChange={(event) =>
                setForm((current) => ({ ...current, department: event.target.value }))
              }
              placeholder="Customer Support"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignee-position">Position</Label>
            <Input
              id="assignee-position"
              value={form.position ?? ""}
              onChange={(event) =>
                setForm((current) => ({ ...current, position: event.target.value }))
              }
              placeholder="Support Agent"
            />
          </div>
          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={isSaving} onClick={() => void handleSave()}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
