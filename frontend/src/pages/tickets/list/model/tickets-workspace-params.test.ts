import { describe, expect, it } from "vite-plus/test";

import {
  buildTicketsSearchParams,
  hasActiveTicketFilters,
  parseTicketsView,
  parseTicketsWorkspaceParams,
} from "./tickets-workspace-params";

describe("parseTicketsView", () => {
  it("defaults unknown values to list", () => {
    expect(parseTicketsView(null)).toBe("list");
    expect(parseTicketsView("kanban")).toBe("list");
    expect(parseTicketsView("board")).toBe("board");
  });
});

describe("parseTicketsWorkspaceParams", () => {
  it("parses filters, multi-value lists, sort, page, and size", () => {
    const params = parseTicketsWorkspaceParams(
      new URLSearchParams(
        "view=board&statusId=2&priority=high,medium&assigneeIds=1,3&tagIds=4&q=payment&code=ut-&sort=deadline,asc&page=2&size=50",
      ),
    );

    expect(params.view).toBe("board");
    expect(params.filters).toEqual({
      page: 2,
      size: 50,
      sort: "deadline,asc",
      statusId: 2,
      priorities: ["high", "medium"],
      assigneeIds: [1, 3],
      tagIds: [4],
      q: "payment",
      code: "ut-",
    });
  });

  it("falls back to defaults for invalid page size and sort", () => {
    const params = parseTicketsWorkspaceParams(
      new URLSearchParams("size=15&sort=title,asc&page=-1"),
    );

    expect(params.filters.size).toBe(20);
    expect(params.filters.sort).toBe("createdAt,desc");
    expect(params.filters.page).toBe(0);
  });
});

describe("buildTicketsSearchParams", () => {
  it("omits defaults and serializes active filters", () => {
    const params = buildTicketsSearchParams({
      view: "list",
      statusId: "all",
      priorities: ["low"],
      assigneeIds: [2],
      tagIds: [1, 5],
      q: " reset ",
      code: "ut-1",
      page: 0,
      size: 20,
      sort: "createdAt,desc",
    });

    expect(params.get("view")).toBe("list");
    expect(params.get("statusId")).toBeNull();
    expect(params.get("priority")).toBe("low");
    expect(params.get("assigneeIds")).toBe("2");
    expect(params.get("tagIds")).toBe("1,5");
    expect(params.get("q")).toBe("reset");
    expect(params.get("code")).toBe("ut-1");
    expect(params.get("page")).toBeNull();
    expect(params.get("size")).toBeNull();
    expect(params.get("sort")).toBeNull();
  });

  it("includes non-default page and size", () => {
    const params = buildTicketsSearchParams({
      view: "board",
      page: 3,
      size: 10,
      sort: "deadline,desc",
    });

    expect(params.toString()).toBe("view=board&page=3&size=10&sort=deadline%2Cdesc");
  });
});

describe("hasActiveTicketFilters", () => {
  it("ignores pagination and sort", () => {
    expect(
      hasActiveTicketFilters({
        page: 2,
        size: 50,
        sort: "deadline,asc",
      }),
    ).toBe(false);

    expect(
      hasActiveTicketFilters({
        page: 0,
        size: 20,
        sort: "createdAt,desc",
        q: "billing",
      }),
    ).toBe(true);
  });
});
