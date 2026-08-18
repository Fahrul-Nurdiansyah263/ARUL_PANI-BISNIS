import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { ServiceError } from "./ticket.service";

/**
 * Register member user ke Arul-Pani Agency.
 * Semua pengguna baru otomatis bergabung ke Arul-Pani Agency sebagai MEMBER.
 */
export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  // Cek email sudah ada
  const email = data.email.trim().toLowerCase();
  const existingUser = await db.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ServiceError("Email sudah terdaftar", 400);
  }

  // Cari perusahaan Arul-Pani Agency (atau buat jika belum ada sebagai fallback)
  let company = await db.company.findFirst({
    where: {
      OR: [
        { slug: "arul-pani-agency" },
        { name: "Arul-Pani Agency" },
      ],
    },
  });

  if (!company) {
    company = await db.company.create({
      data: {
        name: "Arul-Pani Agency",
        slug: "arul-pani-agency",
      },
    });
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Buat akun anggota tim (MEMBER)
  const user = await db.user.create({
    data: {
      name: data.name.trim(),
      email,
      passwordHash,
      role: "MEMBER",
      position: data.position?.trim() || "Staff",
      companyId: company.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      companyId: true,
      createdAt: true,
    },
  });

  return user;
}
