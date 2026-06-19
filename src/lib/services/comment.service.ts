import { db } from "@/lib/db";
import { createCommentSchema } from "@/lib/validations/comment";
import { ServiceError } from "@/lib/services/ticket.service";

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
}

/**
 * Mengambil semua komentar untuk sebuah tiket.
 */
export async function listComments(ticketId: string, user: SessionUser) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { companyId: true },
  });

  if (!ticket) {
    throw new ServiceError("Ticket tidak ditemukan", 404);
  }

  if (ticket.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke ticket ini", 403);
  }

  return await db.ticketComment.findMany({
    where: { ticketId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Membuat komentar baru untuk sebuah tiket.
 */
export async function createComment(
  ticketId: string,
  input: unknown,
  user: SessionUser,
) {
  // Validasi input
  const data = createCommentSchema.parse(input);

  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { companyId: true, assigneeId: true },
  });

  if (!ticket) {
    throw new ServiceError("Ticket tidak ditemukan", 404);
  }

  if (ticket.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke ticket ini", 403);
  }

  // Semua anggota Sejiwa Agency bisa berkomentar di tiket manapun

  return await db.ticketComment.create({
    data: {
      ticketId,
      userId: user.id,
      content: data.content,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
}
