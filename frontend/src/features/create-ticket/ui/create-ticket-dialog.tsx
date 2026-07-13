import {
  CreateTicketDialogProvider,
  useCreateTicketDialog,
} from "@/features/create-ticket/model/create-ticket-dialog-context";
import { CreateTicketForm } from "@/features/create-ticket/ui/create-ticket-form";
import { ResponsiveDialog } from "@/shared/ui/responsive-dialog";

function CreateTicketDialogHost() {
  const { open, navigateOnSuccess, closeCreateTicket } = useCreateTicketDialog();

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) closeCreateTicket();
      }}
      title="Create ticket"
      description="Capture the customer issue. New tickets open automatically"
      className="sm:max-w-xl"
    >
      <CreateTicketForm
        navigateOnSuccess={navigateOnSuccess}
        onCancel={closeCreateTicket}
        onSuccess={() => closeCreateTicket()}
      />
    </ResponsiveDialog>
  );
}

export function CreateTicketDialogRoot({ children }: { children: React.ReactNode }) {
  return (
    <CreateTicketDialogProvider>
      {children}
      <CreateTicketDialogHost />
    </CreateTicketDialogProvider>
  );
}

export { useCreateTicketDialog };
