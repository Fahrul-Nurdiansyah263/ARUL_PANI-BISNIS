import { z } from "zod/v4";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Komentar tidak boleh kosong")
    .max(1000, "Komentar maksimal 1000 karakter"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
