import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type CreateTicketDialogState = {
  open: boolean;
  /** false when opened from a context where jumping to the ticket detail would be disorienting (e.g. the board) */
  navigateOnSuccess: boolean;
};

type CreateTicketDialogContextValue = {
  open: boolean;
  navigateOnSuccess: boolean;
  openCreateTicket: (options?: { navigateOnSuccess?: boolean }) => void;
  closeCreateTicket: () => void;
};

const CreateTicketDialogContext = createContext<CreateTicketDialogContextValue | null>(null);

export function CreateTicketDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CreateTicketDialogState>({
    open: false,
    navigateOnSuccess: true,
  });

  const openCreateTicket = useCallback((options?: { navigateOnSuccess?: boolean }) => {
    setState({ open: true, navigateOnSuccess: options?.navigateOnSuccess ?? true });
  }, []);

  const closeCreateTicket = useCallback(() => {
    setState({ open: false, navigateOnSuccess: true });
  }, []);

  const value = useMemo(
    () => ({
      open: state.open,
      navigateOnSuccess: state.navigateOnSuccess,
      openCreateTicket,
      closeCreateTicket,
    }),
    [state.open, state.navigateOnSuccess, openCreateTicket, closeCreateTicket],
  );

  return (
    <CreateTicketDialogContext.Provider value={value}>
      {children}
    </CreateTicketDialogContext.Provider>
  );
}

export function useCreateTicketDialog() {
  const ctx = useContext(CreateTicketDialogContext);
  if (!ctx) {
    throw new Error("useCreateTicketDialog must be used within CreateTicketDialogProvider");
  }
  return ctx;
}
