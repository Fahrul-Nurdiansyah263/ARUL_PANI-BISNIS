import { z } from "zod/v4";

/**
 * Zod schemas untuk Auth validation.
 */

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.email("Format email tidak valid"),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional(),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
