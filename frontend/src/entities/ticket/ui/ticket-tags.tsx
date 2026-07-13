import type { Tag } from "@/entities/tag";
import { cn } from "@/shared/lib/cn";

type TicketTagsProps = {
  tags: Tag[];
  className?: string;
};

export function TicketTags({ tags, className }: TicketTagsProps) {
  if (tags.length === 0) {
    return <span className={cn("text-xs text-muted-foreground", className)}>No tags</span>;
  }

  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          {tag.name}
        </li>
      ))}
    </ul>
  );
}
