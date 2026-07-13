import { describe, expect, it } from "vite-plus/test";

import {
  assigneeFormSchema,
  firstZodError,
  settingsFormSchema,
  statusFormSchema,
  tagFormSchema,
} from "./settings-form.schemas";

describe("statusFormSchema", () => {
  it("accepts a valid status payload", () => {
    const result = statusFormSchema.safeParse({
      name: "Open",
      color: "#0ea5e9",
      position: 0,
      isInitial: true,
      active: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty name and invalid color", () => {
    const result = statusFormSchema.safeParse({
      name: "   ",
      color: "blue",
      position: 1.5,
      isInitial: false,
      active: true,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(expect.arrayContaining(["name", "color", "position"]));
    }
  });
});

describe("tagFormSchema", () => {
  it("trims and accepts a name", () => {
    const result = tagFormSchema.safeParse({ name: "  billing  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("billing");
    }
  });

  it("rejects an empty name", () => {
    const result = tagFormSchema.safeParse({ name: " " });
    expect(result.success).toBe(false);
  });
});

describe("assigneeFormSchema", () => {
  it("accepts a valid assignee and normalizes blank position to null", () => {
    const result = assigneeFormSchema.safeParse({
      name: "Maya Chen",
      email: "maya@example.com",
      department: "Support",
      position: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.position).toBeNull();
    }
  });

  it("rejects invalid email", () => {
    const result = assigneeFormSchema.safeParse({
      name: "Maya Chen",
      email: "not-an-email",
      department: "Support",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstZodError(result.error)).toMatch(/email/i);
    }
  });
});

describe("settingsFormSchema", () => {
  it("accepts a lowercase ticket code prefix", () => {
    const result = settingsFormSchema.safeParse({ ticketCodePrefix: "ut" });
    expect(result.success).toBe(true);
  });

  it("rejects uppercase or empty prefix", () => {
    expect(settingsFormSchema.safeParse({ ticketCodePrefix: "UT" }).success).toBe(false);
    expect(settingsFormSchema.safeParse({ ticketCodePrefix: "" }).success).toBe(false);
  });
});
