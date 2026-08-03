import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Arul-Pani Agency...')

  // Reset data sebelum seeding
  await db.ticketComment.deleteMany()
  await db.ticket.deleteMany()
  await db.project.deleteMany()
  await db.user.deleteMany()
  await db.company.deleteMany()

  // Buat agency
  const company = await db.company.create({
    data: {
      name: 'Arul-Pani Agency',
      slug: 'arul-pani-agency',
    },
  })

  // Hash password
  const password = await bcrypt.hash('password123', 12)

  // Owner
  const owner1 = await db.user.create({
    data: {
      name: 'Fahrul Nurdiansyah',
      email: 'fahrul@arul-pani.com',
      passwordHash: password,
      role: 'OWNER',
      position: 'Creative Director',
      companyId: company.id,
    },
  })

  const owner2 = await db.user.create({
    data: {
      name: 'Ranu Vanny Ramadhani',
      email: 'vanny@arul-pani.com',
      passwordHash: password,
      role: 'OWNER',
      position: 'Creative Director',
      companyId: company.id,
    },
  })




  console.log('✅ Seeding selesai!')
  console.log('')
  console.log('📋 Akun tersedia (password: password123):')
  console.log('  fahrul@arul-pani.com  — OWNER (Creative Director)')
  console.log('  vanny@arul-pani.com  — OWNER (Creative Director)')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())