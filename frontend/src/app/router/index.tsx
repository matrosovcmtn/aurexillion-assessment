import { BrowserRouter, Route, Routes } from "react-router";

import { AppLayout } from "@/app/layouts/app-layout";
import { SettingsPage } from "@/pages/settings";
import { CreateTicketPage } from "@/pages/tickets/create";
import { TicketDetailPage } from "@/pages/tickets/detail";
import { TicketsListPage } from "@/pages/tickets/list";
import { NotFoundPage } from "@/pages/tickets/not-found";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<TicketsListPage />} />
          <Route path="tickets/new" element={<CreateTicketPage />} />
          <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
