import type { ReactNode } from "react";

import { QueryProvider } from "@/app/providers/query-provider";
import { Toaster } from "@/shared/ui/toast";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
