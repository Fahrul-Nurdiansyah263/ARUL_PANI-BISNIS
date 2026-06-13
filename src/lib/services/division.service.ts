import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { createDivisionSchema } from "@/lib/validations/division";
import { ServiceError } from "./ticket.service";

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
  divisionId: string | null;
}

/**
 * List divisions dengan pagination.
 */
export async function listDivisions(
  companyId: string,
  options: { page: number; limit: number; skip: number },
) {
  const where = { companyId };

  const [divisions, total] = await Promise.all([
    db.division.findMany({
      where,
      orderBy: { name: "asc" },
      skip: options.skip,
      take: options.limit,
    }),
    db.division.count({ where }),
  ]);

  return { divisions, total };
}

/**
 * Create division baru.
 */
export async function createDivision(input: unknown, user: SessionUser) {
  if (!hasPermission(user.role, "canManageDivisions")) {
    throw new ServiceError(
      "Anda tidak memiliki izin untuk mengelola divisi",
      403,
    );
  }

  const data = createDivisionSchema.parse(input);

  const division = await db.division.create({
    data: {
      name: data.name,
      description: data.description,
      companyId: user.companyId,
    },
  });

  return division;
}
