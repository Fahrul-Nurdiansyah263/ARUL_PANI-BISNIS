import { z } from "zod/v4";

export const docCategoryEnum = z.enum([
  "GENERAL",
  "DOCUMENTATION",
  "MARKETING",
  "LOG",
  "ROADMAP",
  "VISION",
  "MEETING_NOTES",
]);

export const createProjectDocSchema = z.object({
  title: z
    .string()
    .min(1, "Judul dokumen wajib diisi")
    .max(150, "Judul dokumen maksimal 150 karakter")
    .default("Tanpa Judul"),
  parentId: z.string().optional().nullable(),
  category: docCategoryEnum.optional().default("GENERAL"),
  content: z.string().optional().nullable(),
  coverUrl: z.string().url("URL gambar tidak valid").optional().nullable(),
  order: z.number().int().optional().default(0),
});

export const updateProjectDocSchema = z.object({
  title: z
    .string()
    .min(1, "Judul dokumen wajib diisi")
    .max(150, "Judul dokumen maksimal 150 karakter")
    .optional(),
  parentId: z.string().optional().nullable(),
  category: docCategoryEnum.optional(),
  content: z.string().optional().nullable(),
  coverUrl: z.string().url("URL gambar tidak valid").optional().nullable(),
  order: z.number().int().optional(),
});

export type CreateProjectDocInput = z.infer<typeof createProjectDocSchema>;
export type UpdateProjectDocInput = z.infer<typeof updateProjectDocSchema>;
