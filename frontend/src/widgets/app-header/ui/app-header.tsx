import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  DashboardSquare02Icon,
  ListViewIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { useCreateTicketDialog } from "@/features/create-ticket/ui/create-ticket-dialog";
import { cn } from "@/shared/lib/cn";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

function workspaceHref(view: "list" | "board", searchParams: URLSearchParams): string {
  const next = new URLSearchParams(searchParams);
  next.set("view", view);
  if (view === "board") {
    next.delete("statusId");
  }
  const qs = next.toString();
  return qs ? `/?${qs}` : "/?view=list";
}

function sectionTitle(pathname: string, view: "list" | "board"): string {
  if (pathname.startsWith("/settings")) {
    return "Settings";
  }
  return view === "board" ? "Tickets – Board" : "Tickets – List";
}

export function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { openCreateTicket } = useCreateTicketDialog();
  const view = searchParams.get("view") === "board" ? "board" : "list";
  const onWorkspace = location.pathname === "/";
  const title = sectionTitle(location.pathname, view);

  return (
    <header className="shrink-0 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-full items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw]">
        <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">{title}</h1>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Button
            type="button"
            size="icon-lg"
            className="sm:hidden"
            aria-label="Create ticket"
            onClick={() => openCreateTicket()}
          >
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          </Button>
          <Button
            type="button"
            size="lg"
            className="hidden sm:inline-flex"
            onClick={() => openCreateTicket()}
          >
            Create ticket
          </Button>

          <Tabs
            value={onWorkspace ? view : ""}
            onValueChange={(next) => {
              if (next === "list" || next === "board") {
                void navigate(workspaceHref(next, searchParams));
              }
            }}
          >
            <TabsList aria-label="Workspace views">
              <TabsTrigger
                value="list"
                className="gap-1 px-2 sm:gap-1.5 sm:px-2.5 sm:text-[0.8125rem]"
              >
                <HugeiconsIcon icon={ListViewIcon} strokeWidth={2} />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
              <TabsTrigger
                value="board"
                className="gap-1 px-2 sm:gap-1.5 sm:px-2.5 sm:text-[0.8125rem]"
              >
                <HugeiconsIcon icon={DashboardSquare02Icon} strokeWidth={2} />
                <span className="hidden sm:inline">Board</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Link
            to="/settings"
            aria-label="Settings"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-lg" }),
              location.pathname.startsWith("/settings") && "bg-muted",
            )}
          >
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={2} />
          </Link>
        </div>
      </div>
    </header>
  );
}
