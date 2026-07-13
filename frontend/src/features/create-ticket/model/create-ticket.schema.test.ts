import { describe, expect, it } from "vite-plus/test";

import { createTicketSchema } from "@/features/create-ticket";

describe("createTicketSchema", () => {
  it("accepts a valid ticket payload", () => {
    const result = createTicketSchema.safeParse({
      title: "Payment failed",
      description: "Card is declined at checkout.",
      customerName: "Jane Smith",
      customerEmail: "jane@example.com",
      priority: "high",
      tagIds: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty required fields and invalid email", () => {
    const result = createTicketSchema.safeParse({
      title: "   ",
      description: "",
      customerName: "",
      customerEmail: "not-an-email",
      priority: "urgent",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(
        expect.arrayContaining([
          "title",
          "description",
          "customerName",
          "customerEmail",
          "priority",
        ]),
      );
    }
  });
});
