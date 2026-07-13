import type { ReactNode } from "react";

import { MEDIA_SM_UP, useMediaQuery } from "@/shared/lib/use-media-query";
import { cn } from "@/shared/lib/cn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";

type ResponsiveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ResponsiveDialogProps) {
  const isWideEnoughForDialog = useMediaQuery(MEDIA_SM_UP);

  if (isWideEnoughForDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={className ?? "sm:max-w-xl"}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "[--drawer-inset:0px] w-full max-w-none rounded-none rounded-t-xl border-x-0",
          className,
        )}
      >
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
