import { useNavigate } from "react-router";

import { useCreateTicketMutation, type CreateTicketInput, type Ticket } from "@/entities/ticket";
import { isApiError } from "@/shared/api";
import { toast } from "@/shared/ui/toast";

type CreateTicketOptions = {
  navigateToDetail?: boolean;
  onSuccess?: (ticket: Ticket) => void;
};

export function useCreateTicket() {
  const navigate = useNavigate();
  const mutation = useCreateTicketMutation();

  async function createTicket(input: CreateTicketInput, options: CreateTicketOptions = {}) {
    const { navigateToDetail = true, onSuccess } = options;

    try {
      const ticket = await mutation.mutateAsync(input);
      toast.success({
        title: "Ticket created",
        description: "The new ticket is ready to review",
      });
      onSuccess?.(ticket);
      if (navigateToDetail) {
        void navigate(`/?view=list&ticket=${ticket.id}`);
      }
      return ticket;
    } catch (error) {
      if (isApiError(error)) {
        throw error;
      }
      throw new Error("Could not create the ticket. Please try again.");
    }
  }

  return {
    createTicket,
    isPending: mutation.isPending,
  };
}
