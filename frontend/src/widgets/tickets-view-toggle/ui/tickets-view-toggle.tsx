import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

type TicketsView = "list" | "board";

type TicketsViewToggleProps = {
  view: TicketsView;
  onViewChange: (view: TicketsView) => void;
};

export function TicketsViewToggle({ view, onViewChange }: TicketsViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Tickets view"
      className="inline-flex rounded-md border border-border p-0.5"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={view === "list"}
        className={cn("rounded-sm", view === "list" && "bg-muted text-foreground")}
        onClick={() => onViewChange("list")}
      >
        List
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-pressed={view === "board"}
        className={cn("rounded-sm", view === "board" && "bg-muted text-foreground")}
        onClick={() => onViewChange("board")}
      >
        Board
      </Button>
    </div>
  );
}
