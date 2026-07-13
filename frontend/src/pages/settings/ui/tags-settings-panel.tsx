import { useState } from "react";

import {
  useCreateTagMutation,
  useDeleteTagMutation,
  useTagsQuery,
  useUpdateTagMutation,
  type Tag,
  type TagInput,
} from "@/entities/tag";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { toast } from "@/shared/ui/toast";

import { firstZodError, tagFormSchema } from "../model/settings-form.schemas";

export function TagsSettingsPanel() {
  const tagsQuery = useTagsQuery();
  const createMutation = useCreateTagMutation();
  const updateMutation = useUpdateTagMutation();
  const deleteMutation = useDeleteTagMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [form, setForm] = useState<TagInput>({ name: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setEditing(null);
    setForm({ name: "" });
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(tag: Tag) {
    setEditing(tag);
    setForm({ name: tag.name });
    setFormError(null);
    setDialogOpen(true);
  }

  async function handleSave() {
    setFormError(null);
    const parsed = tagFormSchema.safeParse(form);
    if (!parsed.success) {
      setFormError(firstZodError(parsed.error));
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, input: parsed.data });
        toast.success({ title: "Tag updated" });
      } else {
        await createMutation.mutateAsync(parsed.data);
        toast.success({ title: "Tag created" });
      }
      setDialogOpen(false);
    } catch (error) {
      setFormError(isApiError(error) ? error.message : "Could not save tag.");
    }
  }

  async function handleDelete(tag: Tag) {
    try {
      await deleteMutation.mutateAsync(tag.id);
      toast.success({ title: "Tag deleted" });
    } catch (error) {
      toast.error({
        title: "Delete failed",
        description: isApiError(error) ? error.message : "Could not delete tag.",
      });
    }
  }

  const tags = tagsQuery.data ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Labels you can attach to tickets</p>
        <Button type="button" size="sm" onClick={openCreate}>
          Add tag
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <Table containerClassName="overflow-visible">
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEdit(tag)}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDelete(tag)}
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
        title={editing ? "Edit tag" : "Add tag"}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tag-name">Name</Label>
            <Input
              id="tag-name"
              value={form.name}
              onChange={(event) => setForm({ name: event.target.value })}
              placeholder="billing"
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
