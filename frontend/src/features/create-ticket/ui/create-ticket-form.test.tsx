import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vite-plus/test";

import { CreateTicketForm } from "@/features/create-ticket";

vi.mock("@/entities/assignee", () => ({
  useAssigneesQuery: () => ({ data: [], isPending: false }),
}));

vi.mock("@/entities/tag", () => ({
  useTagsQuery: () => ({ data: [], isPending: false }),
}));

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreateTicketForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CreateTicketForm", () => {
  it("shows validation errors and does not call the API", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    renderForm();

    await user.click(screen.getByRole("button", { name: "Create ticket" }));

    expect(await screen.findByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Description is required")).toBeInTheDocument();
    expect(screen.getByText("Customer name is required")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
