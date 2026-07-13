import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { TicketStatusSelect } from "@/features/update-ticket-status";
import { sampleStatuses } from "@/test/fixtures/tickets";

const updateStatus = vi.fn().mockResolvedValue({
  id: 1,
  status: sampleStatuses[1],
});

vi.mock("@/features/update-ticket-status/model/use-update-ticket-status", () => ({
  useUpdateTicketStatus: () => ({
    updateStatus,
    isPending: false,
    pendingTicketId: null,
  }),
}));

vi.mock("@/entities/status", async () => {
  const actual = await vi.importActual<typeof import("@/entities/status")>("@/entities/status");
  return {
    ...actual,
    useStatusesQuery: () => ({
      data: [...sampleStatuses],
      isPending: false,
    }),
  };
});

describe("TicketStatusSelect", () => {
  it("requests a status update when a new value is chosen", async () => {
    const user = userEvent.setup();

    render(<TicketStatusSelect ticketId={1} status={sampleStatuses[0]} label="Status" />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "In Progress" }));

    expect(updateStatus).toHaveBeenCalledWith(1, 2);
  });
});
