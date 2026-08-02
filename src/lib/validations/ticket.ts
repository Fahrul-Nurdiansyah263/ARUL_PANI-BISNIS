import { z } from "zod/v4";

/**
 * Zod schemas untuk Ticket validation.
 */

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(1, "Judul ticket wajib diisi")
    .max(200, "Judul maksimal 200 karakter"),
  description: z.string().max(2000, "Deskripsi maksimal 2000 karakter").optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional()
    .or(z.string().date().nullable().optional()),
});

export const updateTicketSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "PRIORITY", "REVIEW",  "DONE"]).optional(),
  assigneeId: z.string().nullable().optional(),
  projectId: z.string().nullable().optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional()
    .or(z.string().date().nullable().optional()),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
