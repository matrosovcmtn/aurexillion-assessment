import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { getInitials } from "@/shared/lib/initials";
import { cn } from "@/shared/lib/cn";

type UserAvatarProps = {
  name: string;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function UserAvatar({ name, className, size = "default" }: UserAvatarProps) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback className={cn("bg-muted font-medium text-muted-foreground")}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
