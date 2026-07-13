import { z } from "zod";

export const statusFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #0ea5e9"),
  position: z.number().int("Position must be a whole number"),
  isInitial: z.boolean(),
  active: z.boolean(),
});

export const tagFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
});

export const assigneeFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email is too long"),
  department: z.string().trim().min(1, "Department is required").max(255, "Department is too long"),
  position: z
    .string()
    .trim()
    .max(255, "Position is too long")
    .optional()
    .transform((value) => (value && value.length > 0 ? value : null)),
});

export const settingsFormSchema = z.object({
  ticketCodePrefix: z
    .string()
    .trim()
    .min(1, "Prefix is required")
    .max(16, "Prefix must be at most 16 characters")
    .regex(/^[a-z0-9]+$/, "Use lowercase letters and digits only"),
});

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
