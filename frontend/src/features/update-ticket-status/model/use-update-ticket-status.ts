import { useUpdateTicketStatusMutation } from "@/entities/ticket";
import { isApiError } from "@/shared/api";
import { toast } from "@/shared/ui/toast";

export function useUpdateTicketStatus() {
  const mutation = useUpdateTicketStatusMutation();

  async function updateStatus(ticketId: number, statusId: number) {
    try {
      const ticket = await mutation.mutateAsync({
        ticketId,
        input: { statusId },
      });
      toast.success({
        title: "Status updated",
        description: `Ticket is now ${ticket.status.name}.`,
      });
      return ticket;
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "Could not update ticket status. Please try again.";
      toast.error({
        title: "Status update failed",
        description: message,
      });
      throw error;
    }
  }

  const pendingTicketId =
    mutation.isPending && mutation.variables ? mutation.variables.ticketId : null;

  return {
    updateStatus,
    isPending: mutation.isPending,
    pendingTicketId,
  };
}
