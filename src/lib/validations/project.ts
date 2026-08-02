import { z } from "zod/v4";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Nama proyek wajib diisi")
    .max(100, "Nama proyek maksimal 100 karakter"),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .nullable(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED"]).optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Nama proyek wajib diisi")
    .max(100, "Nama proyek maksimal 100 karakter")
    .optional(),
  description: z
    .string()
    .max(1000, "Deskripsi maksimal 1000 karakter")
    .optional()
    .nullable(),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
