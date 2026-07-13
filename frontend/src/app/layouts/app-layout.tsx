import { Outlet } from "react-router";

import { CreateTicketDialogRoot } from "@/features/create-ticket/ui/create-ticket-dialog";
import { AppHeader } from "@/widgets/app-header";

export function AppLayout() {
  return (
    <CreateTicketDialogRoot>
      <div className="flex h-svh flex-col overflow-hidden bg-background">
        <AppHeader />
        <main className="mx-auto flex min-h-0 w-full max-w-full flex-1 flex-col px-4 py-4 sm:px-6 lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw]">
          <Outlet />
        </main>
      </div>
    </CreateTicketDialogRoot>
  );
}
