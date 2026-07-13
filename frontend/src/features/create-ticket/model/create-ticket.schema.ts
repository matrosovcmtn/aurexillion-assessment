import { z } from "zod";

import { TICKET_PRIORITIES } from "@/entities/ticket";

export const createTicketSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description is too long"),
  customerName: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(255, "Customer name is too long"),
  customerEmail: z
    .string()
    .trim()
    .min(1, "Customer email is required")
    .email("Enter a valid email address")
    .max(255, "Customer email is too long"),
  priority: z.enum(TICKET_PRIORITIES, { error: "Priority is required" }),
  deadline: z.string().optional(),
  assigneeId: z.string().optional(),
  tagIds: z.array(z.number().int().positive()),
});

export type CreateTicketFormValues = z.infer<typeof createTicketSchema>;
