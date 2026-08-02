import { db } from "@/lib/db";

/**
 * List users dengan pagination.
 */
export async function listUsers(
  companyId: string,
  options: {
    page: number;
    limit: number;
    skip: number;
  },
) {
  const where: Record<string, unknown> = {
    companyId,
    isActive: true,
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, position: true, avatarUrl: true, isActive: true },
      orderBy: { name: "asc" },
      skip: options.skip,
      take: options.limit,
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}
