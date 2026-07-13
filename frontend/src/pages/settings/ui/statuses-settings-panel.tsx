import { useState } from "react";

import {
  useCreateStatusMutation,
  useDeleteStatusMutation,
  useStatusesQuery,
  useUpdateStatusMutation,
  type Status,
  type StatusInput,
} from "@/entities/status";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";
import { Switch } from "@/shared/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";

import { firstZodError, statusFormSchema } from "../model/settings-form.schemas";

const emptyForm: StatusInput = {
  name: "",
  color: "#0ea5e9",
  position: 0,
  isInitial: false,
  active: true,
};

export function StatusesSettingsPanel() {
  const statusesQuery = useStatusesQuery();
  const createMutation = useCreateStatusMutation();
  const updateMutation = useUpdateStatusMutation();
  const deleteMutation = useDeleteStatusMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Status | null>(null);
  const [form, setForm] = useState<StatusInput>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm,
      position: statusesQuery.data?.length ?? 0,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(status: Status) {
    setEditing(status);
    setForm({
      name: status.name,
      color: status.color,
      position: status.position,
      isInitial: status.isInitial,
      active: status.active,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    const parsed = statusFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(firstZodError(parsed.error));
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: parsed.data });
        toast.success({ title: "Status updated" });
      } else {
        await createMutation.mutateAsync(parsed.data);
        toast.success({ title: "Status created" });
      }
      setDialogOpen(false);
    } catch (error) {
      setFormError(isApiError(error) ? error.message : "Could not save status.");
    }
  }

  async function handleDelete(status: Status) {
    try {
      await deleteMutation.mutateAsync(status.id);
      toast.success({ title: "Status deleted" });
    } catch (error) {
      toast.error({
        title: "Delete failed",
        description: isApiError(error) ? error.message : "Could not delete status.",
      });
    }
  }

  const statuses = statusesQuery.data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Workflow columns for the board and status pickers
        </p>
        <Button type="button" size="sm" onClick={openCreate}>
          Add status
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Initial</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow key={status.id}>
                <TableCell className="font-medium">{status.name}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                      aria-hidden
                    />
                    {status.color}
                  </span>
                </TableCell>
                <TableCell>{status.position}</TableCell>
                <TableCell>{status.isInitial ? "Yes" : "No"}</TableCell>
                <TableCell>{status.active ? "Yes" : "No"}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(status)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(status)}
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
        title={editing ? "Edit status" : "Add status"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="status-name">Name</Label>
            <Input
              id="status-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="In Progress"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status-color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="status-color"
                type="color"
                className="h-9 w-12 p-1"
                value={form.color}
                onChange={(event) =>
                  setForm((current) => ({ ...current, color: event.target.value }))
                }
              />
              <Input
                value={form.color}
                onChange={(event) =>
                  setForm((current) => ({ ...current, color: event.target.value }))
                }
                placeholder="#0ea5e9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="status-position">Position</Label>
            <Input
              id="status-position"
              type="number"
              value={form.position}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  position: Number(event.target.value) || 0,
                }))
              }
              placeholder="0"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="status-is-initial" className="cursor-pointer">
              Initial status for new tickets
            </Label>
            <Switch
              id="status-is-initial"
              checked={form.isInitial}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, isInitial: checked }))
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="status-active" className="cursor-pointer">
              Active
            </Label>
            <Switch
              id="status-active"
              checked={form.active ?? true}
              onCheckedChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
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
