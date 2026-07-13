import { useAssigneesQuery } from "@/entities/assignee";
import { useSettingsQuery } from "@/entities/settings";
import { useStatusesQuery } from "@/entities/status";
import { useTagsQuery } from "@/entities/tag";

export function SettingsOverviewPanel() {
  const statusesQuery = useStatusesQuery();
  const tagsQuery = useTagsQuery();
  const assigneesQuery = useAssigneesQuery();
  const settingsQuery = useSettingsQuery();

  const activeStatuses = (statusesQuery.data ?? []).filter((status) => status.active).length;
  const initialStatus = (statusesQuery.data ?? []).find((status) => status.isInitial);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Snapshot of reference data used across tickets, filters, and the board.
      </p>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 border-b border-border pb-3">
          <dt className="text-xs text-muted-foreground">Ticket code prefix</dt>
          <dd className="text-sm font-medium">{settingsQuery.data?.ticketCodePrefix ?? "–"}</dd>
        </div>
        <div className="space-y-1 border-b border-border pb-3">
          <dt className="text-xs text-muted-foreground">Initial status</dt>
          <dd className="text-sm font-medium">{initialStatus?.name ?? "–"}</dd>
        </div>
        <div className="space-y-1 border-b border-border pb-3">
          <dt className="text-xs text-muted-foreground">Active statuses</dt>
          <dd className="text-sm font-medium">{statusesQuery.isPending ? "…" : activeStatuses}</dd>
        </div>
        <div className="space-y-1 border-b border-border pb-3">
          <dt className="text-xs text-muted-foreground">Tags</dt>
          <dd className="text-sm font-medium">
            {tagsQuery.isPending ? "…" : (tagsQuery.data?.length ?? 0)}
          </dd>
        </div>
        <div className="space-y-1 border-b border-border pb-3">
          <dt className="text-xs text-muted-foreground">Assignees</dt>
          <dd className="text-sm font-medium">
            {assigneesQuery.isPending ? "…" : (assigneesQuery.data?.length ?? 0)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
