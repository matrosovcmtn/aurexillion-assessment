import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { TicketsTable } from "@/widgets/tickets-table";
import { sampleTickets } from "@/test/fixtures/tickets";

describe("TicketsTable", () => {
  it("renders ticket fields and opens a ticket on row click", async () => {
    const user = userEvent.setup();
    const onTicketOpen = vi.fn();

    render(<TicketsTable tickets={sampleTickets} onTicketOpen={onTicketOpen} />);

    expect(screen.getAllByText("Unable to complete payment").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ut-1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maya Chen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Open").length).toBeGreaterThan(0);
    expect(screen.getAllByText("High").length).toBeGreaterThan(0);
    expect(screen.getAllByText("billing").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jun 18, 2026/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jul 1, 2026/).length).toBeGreaterThan(0);

    await user.click(screen.getAllByText("Unable to complete payment")[0]);
    expect(onTicketOpen).toHaveBeenCalledWith(1);
  });
});
