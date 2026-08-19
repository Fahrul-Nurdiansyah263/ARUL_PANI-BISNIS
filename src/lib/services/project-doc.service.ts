import { db } from "@/lib/db";
import { ServiceError } from "./ticket.service";
import {
  createProjectDocSchema,
  updateProjectDocSchema,
} from "@/lib/validations/project-doc";

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
}

/**
 * Validasi akses pengguna ke proyek.
 */
async function verifyProjectAccess(projectId: string, user: SessionUser) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, companyId: true, name: true },
  });

  if (!project) {
    throw new ServiceError("Proyek tidak ditemukan", 404);
  }

  const currentUser = await db.user.findUnique({
    where: { id: user.id },
    select: { companyId: true },
  });

  const userCompanyId = currentUser?.companyId || user.companyId;

  if (project.companyId !== userCompanyId) {
    throw new ServiceError("Anda tidak memiliki akses ke proyek ini", 403);
  }

  return project;
}

/**
 * Mengambil daftar semua dokumen dalam sebuah proyek.
 */
export async function listProjectDocs(projectId: string, user: SessionUser) {
  await verifyProjectAccess(projectId, user);

  const docs = await db.projectDoc.findMany({
    where: { projectId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { children: true },
      },
    },
    orderBy: [
      { order: "asc" },
      { createdAt: "asc" },
    ],
  });

  return docs;
}

/**
 * Mengambil satu dokumen spesifik beserta sub-halamannya.
 */
export async function getProjectDoc(
  projectId: string,
  docId: string,
  user: SessionUser
) {
  await verifyProjectAccess(projectId, user);

  const doc = await db.projectDoc.findUnique({
    where: { id: docId },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      children: {
        select: {
          id: true,
          title: true,
          category: true,
          order: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!doc || doc.projectId !== projectId) {
    throw new ServiceError("Dokumen tidak ditemukan", 404);
  }

  return doc;
}

/**
 * Membuat dokumen baru dalam proyek.
 */
export async function createProjectDoc(
  projectId: string,
  input: unknown,
  user: SessionUser
) {
  await verifyProjectAccess(projectId, user);

  const data = createProjectDocSchema.parse(input);

  // Jika parentId diisi, pastikan parentDoc ada di proyek yang sama
  if (data.parentId) {
    const parentDoc = await db.projectDoc.findUnique({
      where: { id: data.parentId },
      select: { id: true, projectId: true },
    });

    if (!parentDoc || parentDoc.projectId !== projectId) {
      throw new ServiceError("Halaman induk (parent) tidak valid", 400);
    }
  }

  const doc = await db.projectDoc.create({
    data: {
      projectId,
      parentId: data.parentId || null,
      title: data.title || "Tanpa Judul",
      category: data.category || "GENERAL",
      content: data.content || "",
      coverUrl: data.coverUrl || null,
      order: data.order ?? 0,
      createdById: user.id,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return doc;
}

/**
 * Memperbarui dokumen (judul, konten, cover, kategori, urutan, parent).
 */
export async function updateProjectDoc(
  projectId: string,
  docId: string,
  input: unknown,
  user: SessionUser
) {
  await verifyProjectAccess(projectId, user);

  const existing = await db.projectDoc.findUnique({
    where: { id: docId },
    select: { id: true, projectId: true },
  });

  if (!existing || existing.projectId !== projectId) {
    throw new ServiceError("Dokumen tidak ditemukan", 404);
  }

  const data = updateProjectDocSchema.parse(input);

  // Hindari circular dependency jika parentId mengarah ke diri sendiri
  if (data.parentId !== undefined && data.parentId !== null) {
    if (data.parentId === docId) {
      throw new ServiceError("Dokumen tidak bisa menjadi induk untuk dirinya sendiri", 400);
    }

    const parentDoc = await db.projectDoc.findUnique({
      where: { id: data.parentId },
      select: { id: true, projectId: true },
    });

    if (!parentDoc || parentDoc.projectId !== projectId) {
      throw new ServiceError("Halaman induk (parent) tidak valid", 400);
    }
  }

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.content !== undefined) updateData.content = data.content;
  if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.parentId !== undefined) updateData.parentId = data.parentId;

  const updated = await db.projectDoc.update({
    where: { id: docId },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return updated;
}

/**
 * Menghapus dokumen (dan secara otomatis menghapus sub-halaman anak berkat onDelete: Cascade).
 */
export async function deleteProjectDoc(
  projectId: string,
  docId: string,
  user: SessionUser
) {
  await verifyProjectAccess(projectId, user);

  const existing = await db.projectDoc.findUnique({
    where: { id: docId },
    select: { id: true, projectId: true },
  });

  if (!existing || existing.projectId !== projectId) {
    throw new ServiceError("Dokumen tidak ditemukan", 404);
  }

  await db.projectDoc.delete({
    where: { id: docId },
  });
}
