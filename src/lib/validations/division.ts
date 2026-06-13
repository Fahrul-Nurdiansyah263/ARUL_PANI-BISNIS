import { z } from "zod/v4";

/**
 * Zod schemas untuk Division validation.
 */

export const createDivisionSchema = z.object({
  name: z
    .string()
    .min(1, "Nama divisi wajib diisi")
    .max(100, "Nama divisi maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
