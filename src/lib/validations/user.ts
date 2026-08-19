import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  email: z.email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter"),
  role: z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional().nullable(),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional(),
  email: z.email("Format email tidak valid").optional(),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter")
    .max(100, "Password maksimal 100 karakter")
    .optional()
    .or(z.literal("")),
  role: z.enum(["OWNER", "MEMBER"]).optional(),
  position: z.string().max(100, "Jabatan maksimal 100 karakter").optional().nullable(),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().nullable(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
