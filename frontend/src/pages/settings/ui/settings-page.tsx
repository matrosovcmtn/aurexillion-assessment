import { AssigneesSettingsPanel } from "./assignees-settings-panel";
import { GeneralSettingsPanel } from "./general-settings-panel";
import { SettingsOverviewPanel } from "./settings-overview-panel";
import { StatusesSettingsPanel } from "./statuses-settings-panel";
import { TagsSettingsPanel } from "./tags-settings-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export function SettingsPage() {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <p className="shrink-0 text-sm text-muted-foreground">
        Overview and management for statuses, tags, assignees, and ticket codes
      </p>

      <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList
          variant="line"
          className="h-auto! min-h-8 w-full max-w-full shrink-0 flex-wrap justify-start gap-y-1 pb-2"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="statuses">Statuses</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="assignees">Assignees</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="min-h-0 flex-1 overflow-y-auto pt-4">
          <SettingsOverviewPanel />
        </TabsContent>
        <TabsContent value="statuses" className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
          <StatusesSettingsPanel />
        </TabsContent>
        <TabsContent value="tags" className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
          <TagsSettingsPanel />
        </TabsContent>
        <TabsContent
          value="assignees"
          className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4"
        >
          <AssigneesSettingsPanel />
        </TabsContent>
        <TabsContent value="general" className="min-h-0 flex-1 overflow-y-auto pt-4">
          <GeneralSettingsPanel />
        </TabsContent>
      </Tabs>
    </section>
  );
}
