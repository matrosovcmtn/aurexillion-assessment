import { useEffect, useState } from "react";

import { useSettingsQuery, useUpdateSettingsMutation } from "@/entities/settings";
import { isApiError } from "@/shared/api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "@/shared/ui/toast";

import { firstZodError, settingsFormSchema } from "../model/settings-form.schemas";

export function GeneralSettingsPanel() {
  const settingsQuery = useSettingsQuery();
  const updateMutation = useUpdateSettingsMutation();
  const [prefix, setPrefix] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (settingsQuery.data) {
      setPrefix(settingsQuery.data.ticketCodePrefix);
    }
  }, [settingsQuery.data]);

  async function handleSave() {
    setFormError(null);
    const parsed = settingsFormSchema.safeParse({ ticketCodePrefix: prefix });
    if (!parsed.success) {
      setFormError(firstZodError(parsed.error));
      return;
    }

    try {
      await updateMutation.mutateAsync(parsed.data);
      toast.success({ title: "Settings saved" });
    } catch (error) {
      setFormError(isApiError(error) ? error.message : "Could not save settings.");
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <p className="text-sm text-muted-foreground">
        Ticket codes are generated as {"{prefix}-{number}"}. Changing the prefix only affects new
        tickets
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="ticket-code-prefix">Ticket code prefix</Label>
        <Input
          id="ticket-code-prefix"
          value={prefix}
          onChange={(event) => setPrefix(event.target.value)}
          placeholder="ut"
        />
      </div>
      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
      <Button
        type="button"
        disabled={updateMutation.isPending || settingsQuery.isPending}
        onClick={() => void handleSave()}
      >
        {updateMutation.isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
