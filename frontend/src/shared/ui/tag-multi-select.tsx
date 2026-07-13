import type { Tag } from "@/entities/tag";
import { MultiSelect } from "@/shared/ui/multi-select";

type TagMultiSelectProps = {
  tags: Tag[];
  value: number[];
  onChange: (tagIds: number[]) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function TagMultiSelect({
  tags,
  value,
  onChange,
  id,
  className,
  placeholder = "Select tags",
  disabled = false,
}: TagMultiSelectProps) {
  return (
    <MultiSelect
      id={id}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      options={tags.map((tag) => ({ value: String(tag.id), label: tag.name }))}
      value={value.map(String)}
      onChange={(next) => onChange(next.map(Number))}
    />
  );
}
