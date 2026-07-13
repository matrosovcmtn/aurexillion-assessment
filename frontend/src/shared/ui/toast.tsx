import * as React from "react";
import { Toast } from "@base-ui/react/toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Loading03Icon,
  MultiplicationSignCircleIcon,
} from "@hugeicons/core-free-icons";

import { buttonVariants } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export type ToastType = "default" | "success" | "error" | "info" | "warning" | "loading";

type ToastInput = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  type?: ToastType;
  timeout?: number;
  priority?: "low" | "high";
};

const toastManager = Toast.createToastManager();

function addToast(input: ToastInput | string, type: ToastType = "default") {
  if (typeof input === "string") {
    return toastManager.add({ title: input, type });
  }

  return toastManager.add({
    title: input.title,
    description: input.description,
    timeout: input.timeout,
    priority: input.priority,
    type: input.type ?? type,
  });
}

export const toast = Object.assign((input: ToastInput | string) => addToast(input, "default"), {
  success: (input: ToastInput | string) => addToast(input, "success"),
  error: (input: ToastInput | string) => addToast(input, "error"),
  info: (input: ToastInput | string) => addToast(input, "info"),
  warning: (input: ToastInput | string) => addToast(input, "warning"),
  loading: (input: ToastInput | string) =>
    addToast(
      typeof input === "string" ? { title: input, timeout: 0 } : { timeout: 0, ...input },
      "loading",
    ),
  promise: toastManager.promise.bind(toastManager),
  dismiss: (toastId?: string) => toastManager.close(toastId),
});

function ToastIcon({ type }: { type?: string }) {
  const className = "size-5 shrink-0";

  switch (type) {
    case "success":
      return (
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className={cn(className, "text-emerald-600 dark:text-emerald-400")}
        />
      );
    case "error":
      return (
        <HugeiconsIcon
          icon={MultiplicationSignCircleIcon}
          className={cn(className, "text-destructive")}
        />
      );
    case "info":
      return (
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className={cn(className, "text-sky-600 dark:text-sky-400")}
        />
      );
    case "warning":
      return (
        <HugeiconsIcon
          icon={Alert02Icon}
          className={cn(className, "text-amber-600 dark:text-amber-400")}
        />
      );
    case "loading":
      return (
        <HugeiconsIcon
          icon={Loading03Icon}
          className={cn(className, "animate-spin text-muted-foreground")}
        />
      );
    default:
      return null;
  }
}

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return toasts.map((toastItem) => (
    <Toast.Root
      key={toastItem.id}
      toast={toastItem}
      data-slot="toast"
      className={cn(
        "absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 w-full origin-bottom",
        "h-[var(--height)] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg select-none",
        "[--gap:0.75rem] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "[--height:var(--toast-frontmost-height,var(--toast-height))]",
        "[--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))]",
        "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
        "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-[var(--toast-height)] data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
        "data-limited:opacity-0",
        "data-starting-style:[transform:translateY(150%)]",
        "data-ending-style:opacity-0",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
      )}
    >
      <Toast.Content
        data-slot="toast-content"
        className={cn(
          "flex h-full items-start gap-2 overflow-hidden p-3 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "data-behind:opacity-0 data-expanded:opacity-100",
        )}
      >
        <div className="flex flex-col justify-center h-full">
          <ToastIcon type={toastItem.type} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pe-6">
          <Toast.Title data-slot="toast-title" className="text-sm font-medium text-foreground" />
          <Toast.Description
            data-slot="toast-description"
            className="text-xs/relaxed text-muted-foreground"
          />
        </div>
        <Toast.Close
          data-slot="toast-close"
          aria-label="Dismiss"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-sm" }),
            "absolute top-2.5 inset-e-2.5",
          )}
        >
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ));
}

function Toaster({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Toast.Provider toastManager={toastManager} timeout={4000} limit={3}>
      <Toast.Portal>
        <Toast.Viewport
          data-slot="toast-viewport"
          className={cn(
            "fixed top-auto right-4 bottom-4 z-50 mx-auto flex w-[calc(100vw-2rem)] flex-col outline-none sm:right-6 sm:bottom-6 sm:w-[22.5rem]",
            className,
          )}
          {...props}
        >
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export { Toaster };
