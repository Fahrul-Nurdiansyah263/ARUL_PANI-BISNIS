import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";
import { ServiceError } from "./ticket.service";

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
}

/**
 * List projects dengan pagination.
 */
export async function listProjects(
  user: SessionUser,
  options: {
    page: number;
    limit: number;
    skip: number;
  },
) {
  const where = {
    companyId: user.companyId,
  };

  const [projects, total] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { name: "asc" },
      skip: options.skip,
      take: options.limit,
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    }),
    db.project.count({ where }),
  ]);

  return { projects, total };
}

/**
 * Create project baru.
 */
export async function createProject(input: unknown, user: SessionUser) {
  if (!hasPermission(user.role, "canCreateProject")) {
    throw new ServiceError("Anda tidak memiliki izin untuk membuat proyek", 403);
  }

  const data = createProjectSchema.parse(input);

  const project = await db.project.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status || "ACTIVE",
      companyId: user.companyId,
    },
  });

  return project;
}

/**
 * Update project.
 */
export async function updateProject(
  projectId: string,
  input: unknown,
  user: SessionUser,
) {
  if (!hasPermission(user.role, "canUpdateProject")) {
    throw new ServiceError("Anda tidak memiliki izin untuk memperbarui proyek", 403);
  }

  const data = updateProjectSchema.parse(input);

  const existing = await db.project.findUnique({
    where: { id: projectId },
    select: { companyId: true },
  });

  if (!existing) {
    throw new ServiceError("Proyek tidak ditemukan", 404);
  }

  if (existing.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke proyek ini", 403);
  }

  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined) updateData.status = data.status;

  const project = await db.project.update({
    where: { id: projectId },
    data: updateData,
  });

  return project;
}

/**
 * Delete project.
 */
export async function deleteProject(projectId: string, user: SessionUser) {
  if (!hasPermission(user.role, "canDeleteProject")) {
    throw new ServiceError("Anda tidak memiliki izin untuk menghapus proyek", 403);
  }

  const existing = await db.project.findUnique({
    where: { id: projectId },
    select: { companyId: true },
  });

  if (!existing) {
    throw new ServiceError("Proyek tidak ditemukan", 404);
  }

  if (existing.companyId !== user.companyId) {
    throw new ServiceError("Anda tidak memiliki akses ke proyek ini", 403);
  }

  await db.project.delete({
    where: { id: projectId },
  });
}
