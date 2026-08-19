import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { hasPermission } from "@/lib/permissions";
import { ServiceError } from "./ticket.service";
import {
  createUserSchema,
  updateUserSchema,
} from "@/lib/validations/user";

interface SessionUser {
  id: string;
  role: string;
  companyId: string;
}

/**
 * List users dengan pagination dan filter.
 */
export async function listUsers(
  companyId: string,
  options: {
    page: number;
    limit: number;
    skip: number;
    search?: string;
    isOwner?: boolean;
  }
) {
  const where: Record<string, unknown> = {
    companyId,
  };

  // Jika bukan owner, hanya tampilkan user aktif
  if (!options.isOwner) {
    where.isActive = true;
  }

  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { email: { contains: options.search, mode: "insensitive" } },
      { position: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedTickets: true,
          },
        },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
      skip: options.skip,
      take: options.limit,
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}

/**
 * Mengambil satu user.
 */
export async function getUser(userId: string, companyId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      companyId: true,
    },
  });

  if (!user || user.companyId !== companyId) {
    throw new ServiceError("Anggota tim tidak ditemukan", 404);
  }

  return user;
}

/**
 * Membuat user baru (Khusus Role OWNER).
 */
export async function createUser(
  companyId: string,
  input: unknown,
  currentUser: SessionUser
) {
  if (!hasPermission(currentUser.role, "canManageUsers")) {
    throw new ServiceError("Hanya OWNER yang memiliki izin untuk menambah anggota tim", 403);
  }

  const data = createUserSchema.parse(input);
  const email = data.email.trim().toLowerCase();

  // Cek apakah email sudah terdaftar
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new ServiceError("Email ini sudah digunakan oleh akun lain", 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const newUser = await db.user.create({
    data: {
      companyId,
      name: data.name,
      email,
      passwordHash,
      role: data.role || "MEMBER",
      position: data.position || null,
      avatarUrl: data.avatarUrl || null,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
    },
  });

  return newUser;
}

/**
 * Memperbarui data user (Khusus Role OWNER).
 */
export async function updateUser(
  userId: string,
  companyId: string,
  input: unknown,
  currentUser: SessionUser
) {
  if (!hasPermission(currentUser.role, "canManageUsers")) {
    throw new ServiceError("Hanya OWNER yang memiliki izin untuk mengedit anggota tim", 403);
  }

  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true, role: true, email: true },
  });

  if (!existing || existing.companyId !== companyId) {
    throw new ServiceError("Anggota tim tidak ditemukan", 404);
  }

  const data = updateUserSchema.parse(input);
  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) {
    // Cegah owner menonaktifkan akunnya sendiri jika sedang login
    if (userId === currentUser.id && data.isActive === false) {
      throw new ServiceError("Anda tidak dapat menonaktifkan akun Anda sendiri", 400);
    }
    updateData.isActive = data.isActive;
  }

  // Jika email diubah, cek duplikasi
  if (data.email && data.email.toLowerCase() !== existing.email.toLowerCase()) {
    const email = data.email.trim().toLowerCase();
    const duplicate = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (duplicate) {
      throw new ServiceError("Email baru sudah digunakan oleh akun lain", 409);
    }
    updateData.email = email;
  }

  // Jika password diubah
  if (data.password && data.password.trim().length > 0) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
    },
  });

  return updatedUser;
}

/**
 * Menghapus user (Khusus Role OWNER).
 */
export async function deleteUser(
  userId: string,
  companyId: string,
  currentUser: SessionUser
) {
  if (!hasPermission(currentUser.role, "canManageUsers")) {
    throw new ServiceError("Hanya OWNER yang memiliki izin untuk menghapus anggota tim", 403);
  }

  // Cegah owner menghapus akunnya sendiri
  if (userId === currentUser.id) {
    throw new ServiceError("Anda tidak dapat menghapus akun Anda sendiri saat sedang login", 400);
  }

  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, companyId: true },
  });

  if (!existing || existing.companyId !== companyId) {
    throw new ServiceError("Anggota tim tidak ditemukan", 404);
  }

  await db.user.delete({
    where: { id: userId },
  });
}
