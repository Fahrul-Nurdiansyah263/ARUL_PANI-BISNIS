import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations/auth";
import { ServiceError } from "./ticket.service";

/**
 * Register agency + owner user (pendaftar pertama = OWNER).
 */
export async function registerCompany(input: unknown) {
  const data = registerSchema.parse(input);

  // Cek email sudah ada
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });
  if (existingUser) {
    throw new ServiceError("Email sudah terdaftar", 400);
  }

  // Buat slug dari company name
  let slug = data.companyName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-") // Collapse multiple dashes
    .replace(/^-|-$/g, ""); // Trim leading/trailing dashes

  // Cek slug collision — tambahkan random suffix jika perlu
  const existingCompany = await db.company.findUnique({ where: { slug } });
  if (existingCompany) {
    const suffix = Math.random().toString(36).substring(2, 6);
    slug = `${slug}-${suffix}`;

    // Double check (sangat unlikely collision tapi defensive)
    const stillExists = await db.company.findUnique({ where: { slug } });
    if (stillExists) {
      throw new ServiceError(
        "Nama perusahaan sudah terdaftar, coba nama lain",
        400,
      );
    }
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Buat company + super admin sekaligus
  const company = await db.company.create({
    data: {
      name: data.companyName,
      slug,
      users: {
        create: {
          name: data.name,
          email: data.email,
          passwordHash,
          role: "OWNER",
        },
      },
    },
    include: { users: true },
  });

  return company;
}
