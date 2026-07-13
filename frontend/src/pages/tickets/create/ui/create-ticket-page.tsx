import { useEffect } from "react";
import { useNavigate } from "react-router";

import { useCreateTicketDialog } from "@/features/create-ticket/ui/create-ticket-dialog";

/** Deep-link compatibility: opens create dialog and returns to the workspace. */
export function CreateTicketPage() {
  const navigate = useNavigate();
  const { openCreateTicket } = useCreateTicketDialog();

  useEffect(() => {
    openCreateTicket();
    void navigate("/?view=list", { replace: true });
  }, [navigate, openCreateTicket]);

  return null;
}
