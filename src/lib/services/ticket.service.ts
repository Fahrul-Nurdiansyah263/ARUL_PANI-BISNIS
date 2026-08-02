import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import {
  createTicketSchema,
  updateTicketSchema,
  type CreateTicketInput,
  type UpdateTicketInput,
} from "@/lib/validations/ticket";

/**
 * Standard include for ticket queries — keeps response shape consistent.
 */
const ticketInclude = {
  assignee: {
    select: {
      id: true,
      name: true,
      role: true,
      avatarUrl: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
  project: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: { select: { comments: true } },
} as const;

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
}

/**
 * List tickets dengan pagination dan scope filtering.
 */
export async function listTickets(
  user: SessionUser,
  options: {
    projectId?: string | null;
    page: number;
    limit: number;
    skip: number;
  },
) {
  const where: Record<string, unknown> = {
    companyId: user.companyId,
  };

  if (options.projectId !== undefined) {
    if (options.projectId === "unassigned") {
      where.projectId = null;
    } else if (options.projectId) {
      where.projectId = options.projectId;
    }
  }

  const [tickets, total] = await Promise.all([
    db.ticket.findMany({
      where,
      include: ticketInclude,
      orderBy: { createdAt: "desc" },
      skip: options.skip,
      take: options.limit,
    }),
    db.ticket.count({ where }),
  ]);

  return { tickets, total };
}


/**
 * Create ticket baru dengan validasi.
 */
export async function createTicket(input: unknown, user: SessionUser) {
  // Permission check
  if (!hasPermission(user.role, "canCreateTicket")) {
    throw new ServiceError("Anda tidak memiliki izin untuk membuat ticket", 403);
  }

  // Validasi input
  const data = createTicketSchema.parse(input);

  const ticket = await db.ticket.create({
    data: {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId || null,
      projectId: data.projectId || null,
      deadline: data.deadline ? new Date(data.deadline) : null,
      companyId: user.companyId,
      createdById: user.id,
    },
    include: ticketInclude,
  });

  return ticket;
}

/**
 * Update ticket — hanya field yang diwhitelist, dengan ownership check.
 */
export async function updateTicket(
  ticketId: string,
  input: unknown,
  user: SessionUser,
) {
  // Validasi input (whitelist fields)
  const data = updateTicketSchema.parse(input);

  // Ownership check: ticket harus milik company user
  const existing = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { companyId: true },
  });

  if (!existing) {
    throw new ServiceError("Ticket tidak ditemukan", 404);
  }

  if (existing.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke ticket ini", 403);
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assigneeId !== undefined) updateData.assigneeId = data.assigneeId;
  if (data.projectId !== undefined) updateData.projectId = data.projectId || null;
  if (data.deadline !== undefined) {
    updateData.deadline = data.deadline ? new Date(data.deadline) : null;
  }

  const ticket = await db.ticket.update({
    where: { id: ticketId },
    data: updateData,
    include: ticketInclude,
  });

  return ticket;
}

/**
 * Delete ticket — dengan ownership + permission check.
 */
export async function deleteTicket(ticketId: string, user: SessionUser) {
  // Permission check
  if (!hasPermission(user.role, "canDeleteTicket")) {
    throw new ServiceError(
      "Anda tidak memiliki izin untuk menghapus ticket",
      403,
    );
  }

  // Ownership check
  const existing = await db.ticket.findUnique({
    where: { id: ticketId },
    select: { companyId: true },
  });

  if (!existing) {
    throw new ServiceError("Ticket tidak ditemukan", 404);
  }

  if (existing.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke ticket ini", 403);
  }

  await db.ticket.delete({ where: { id: ticketId } });
}

/**
 * Custom error class untuk service layer.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
