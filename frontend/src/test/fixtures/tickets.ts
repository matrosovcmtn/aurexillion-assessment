import type { Ticket } from "@/entities/ticket";

export const sampleStatuses = [
  {
    id: 1,
    name: "Open",
    color: "#0ea5e9",
    position: 0,
    isInitial: true,
    active: true,
  },
  {
    id: 2,
    name: "In Progress",
    color: "#f59e0b",
    position: 1,
    isInitial: false,
    active: true,
  },
  {
    id: 3,
    name: "Resolved",
    color: "#10b981",
    position: 2,
    isInitial: false,
    active: true,
  },
] as const;

export const sampleTickets: Ticket[] = [
  {
    id: 1,
    code: "ut-1",
    title: "Unable to complete payment",
    description: "Customer receives an error after submitting the payment form.",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    status: sampleStatuses[0],
    priority: "high",
    deadline: "2026-07-01T17:00:00Z",
    assignee: {
      id: 1,
      name: "Maya Chen",
      email: "maya@example.com",
      department: "Support",
      position: "Support Agent",
    },
    tags: [{ id: 1, name: "billing" }],
    createdAt: "2026-06-18T10:30:00Z",
  },
  {
    id: 2,
    code: "ut-2",
    title: "Cannot reset password",
    description: "Reset email never arrives.",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    status: sampleStatuses[1],
    priority: "medium",
    deadline: null,
    assignee: null,
    tags: [],
    createdAt: "2026-06-17T09:00:00Z",
  },
];
