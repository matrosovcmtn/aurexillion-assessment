import { cn } from "@/shared/lib/cn";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  id?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

function formatSelectedValues(
  selected: string[],
  labels: Map<string, string>,
  placeholder: string,
) {
  if (selected.length === 0) {
    return placeholder;
  }

  const first = labels.get(selected[0]) ?? selected[0];
  if (selected.length === 1) {
    return first;
  }

  return `${first} (+${selected.length - 1} more)`;
}

export function MultiSelect({
  options,
  value,
  onChange,
  id,
  className,
  placeholder = "Select…",
  disabled = false,
}: MultiSelectProps) {
  const labels = new Map(options.map((option) => [option.value, option.label]));

  return (
    <Select multiple items={options} value={value} disabled={disabled} onValueChange={onChange}>
      <SelectTrigger id={id} className={cn("w-full min-w-40", className)}>
        <SelectValue>
          {(selected: string[]) => formatSelectedValues(selected, labels, placeholder)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="start" alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
