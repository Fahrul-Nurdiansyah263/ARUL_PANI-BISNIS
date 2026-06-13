import { db } from "@/lib/db";

/**
 * List users dengan pagination.
 */
export async function listUsers(
  companyId: string,
  options: {
    divisionId?: string | null;
    page: number;
    limit: number;
    skip: number;
  },
) {
  const where: Record<string, unknown> = {
    companyId,
    isActive: true,
  };

  if (options.divisionId) {
    where.divisionId = options.divisionId;
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: { id: true, name: true, role: true, avatarUrl: true },
      orderBy: { name: "asc" },
      skip: options.skip,
      take: options.limit,
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}
