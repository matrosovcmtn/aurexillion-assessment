import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { TicketCard } from "@/entities/ticket";
import { sampleTickets } from "@/test/fixtures/tickets";

describe("TicketCard", () => {
  it("renders ticket fields including empty deadline and tags labels", () => {
    render(<TicketCard ticket={sampleTickets[1]} />);

    expect(screen.getByText("Cannot reset password")).toBeTruthy();
    expect(screen.getByText("ut-2")).toBeTruthy();
    expect(screen.getByText("In Progress")).toBeTruthy();
    expect(screen.getByText("Medium")).toBeTruthy();
    expect(screen.getByText("No tags")).toBeTruthy();
    expect(screen.getByText("No deadline")).toBeTruthy();
  });

  it("can hide the status badge for board columns", () => {
    render(<TicketCard ticket={sampleTickets[0]} showStatus={false} />);

    expect(screen.getByText("Unable to complete payment")).toBeTruthy();
    expect(screen.queryByText("Open")).toBeNull();
  });
});
