import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding...')

  // Buat company
  const company = await db.company.create({
    data: {
      name: 'PT Sadhana Indonesia',
      slug: 'pt-sadhana-indonesia',
    },
  })

  // Buat divisi
  const divisions = await Promise.all([
    db.division.create({ data: { name: 'Engineering', description: 'Tim teknis', companyId: company.id } }),
    db.division.create({ data: { name: 'Marketing', description: 'Tim pemasaran', companyId: company.id } }),
    db.division.create({ data: { name: 'Design', description: 'Tim desain', companyId: company.id } }),
  ])

  const [engineering, marketing, design] = divisions

  // Hash password
  const password = await bcrypt.hash('password123', 12)

  // Buat users
  const superAdmin = await db.user.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@sadhana.com',
      passwordHash: password,
      role: 'SUPER_ADMIN',
      companyId: company.id,
    },
  })

  const adminEng = await db.user.create({
    data: {
      name: 'Admin Engineering',
      email: 'admin.eng@sadhana.com',
      passwordHash: password,
      role: 'ADMIN',
      companyId: company.id,
      divisionId: engineering.id,
    },
  })

  const adminMkt = await db.user.create({
    data: {
      name: 'Admin Marketing',
      email: 'admin.mkt@sadhana.com',
      passwordHash: password,
      role: 'ADMIN',
      companyId: company.id,
      divisionId: marketing.id,
    },
  })

  const employee1 = await db.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi@sadhana.com',
      passwordHash: password,
      role: 'EMPLOYEE',
      companyId: company.id,
      divisionId: engineering.id,
    },
  })

  const employee2 = await db.user.create({
    data: {
      name: 'Sari Dewi',
      email: 'sari@sadhana.com',
      passwordHash: password,
      role: 'EMPLOYEE',
      companyId: company.id,
      divisionId: marketing.id,
    },
  })

  const intern1 = await db.user.create({
    data: {
      name: 'Andi Pratama',
      email: 'andi@sadhana.com',
      passwordHash: password,
      role: 'INTERN',
      companyId: company.id,
      divisionId: engineering.id,
    },
  })

  const intern2 = await db.user.create({
    data: {
      name: 'Rina Kusuma',
      email: 'rina@sadhana.com',
      passwordHash: password,
      role: 'INTERN',
      companyId: company.id,
      divisionId: design.id,
    },
  })

  // Buat tickets
  const ticketData = [
    { title: 'Setup CI/CD pipeline', description: 'Konfigurasi GitHub Actions untuk auto deploy', status: 'IN_PROGRESS', divisionId: engineering.id, assigneeId: employee1.id, createdById: adminEng.id },
    { title: 'Refactor auth module', description: 'Pisahkan logic auth ke service layer', status: 'TODO', divisionId: engineering.id, assigneeId: intern1.id, createdById: adminEng.id },
    { title: 'Fix bug login page', description: 'Error saat password salah tidak muncul', status: 'REVIEW', divisionId: engineering.id, assigneeId: employee1.id, createdById: adminEng.id },
    { title: 'Unit test API tickets', description: 'Tulis unit test untuk semua endpoint ticket', status: 'TODO', divisionId: engineering.id, assigneeId: intern1.id, createdById: employee1.id },
    { title: 'Deploy ke staging', description: 'Deploy versi terbaru ke environment staging', status: 'DONE', divisionId: engineering.id, assigneeId: employee1.id, createdById: adminEng.id },
    { title: 'Buat konten Instagram', description: 'Desain 5 post untuk campaign bulan ini', status: 'IN_PROGRESS', divisionId: marketing.id, assigneeId: employee2.id, createdById: adminMkt.id },
    { title: 'Riset kompetitor', description: 'Analisis strategi marketing kompetitor', status: 'TODO', divisionId: marketing.id, assigneeId: employee2.id, createdById: adminMkt.id },
    { title: 'Email blast newsletter', description: 'Kirim newsletter bulan Juni', status: 'DONE', divisionId: marketing.id, assigneeId: employee2.id, createdById: adminMkt.id },
    { title: 'Redesign landing page', description: 'Update hero section dan CTA', status: 'TODO', divisionId: design.id, assigneeId: intern2.id, createdById: superAdmin.id },
    { title: 'Buat design system', description: 'Dokumentasi color, typography, dan component', status: 'IN_PROGRESS', divisionId: design.id, assigneeId: intern2.id, createdById: superAdmin.id },
  ]

  for (const ticket of ticketData) {
    await db.ticket.create({
      data: {
        ...ticket,
        companyId: company.id,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ticket.status as any,
      },
    })
  }

  // Buat daily reports
  const today = new Date()
  const reportUsers = [employee1, employee2, intern1, intern2]
  const reportContents = [
    { content: 'Mengerjakan setup CI/CD, sudah selesai konfigurasi GitHub Actions', blockers: null },
    { content: 'Riset kompetitor untuk campaign bulan ini, sudah 60% selesai', blockers: 'Butuh akses tools analitik' },
    { content: 'Fixing bug login page, sudah ditemukan root cause-nya', blockers: null },
    { content: 'Mengerjakan redesign landing page, progress hero section 40%', blockers: 'Menunggu feedback dari klien' },
  ]

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    for (let j = 0; j < reportUsers.length; j++) {
      if (Math.random() > 0.2) { // 80% chance submit
        await db.dailyReport.create({
          data: {
            userId: reportUsers[j].id,
            divisionId: reportUsers[j].divisionId!,
            date,
            content: reportContents[j].content,
            blockers: reportContents[j].blockers,
          },
        })
      }
    }
  }

  console.log('✅ Seeding selesai!')
  console.log('')
  console.log('📋 Akun tersedia (password: password123):')
  console.log('  superadmin@sadhana.com — SUPER_ADMIN')
  console.log('  admin.eng@sadhana.com  — ADMIN (Engineering)')
  console.log('  admin.mkt@sadhana.com  — ADMIN (Marketing)')
  console.log('  budi@sadhana.com       — EMPLOYEE (Engineering)')
  console.log('  sari@sadhana.com       — EMPLOYEE (Marketing)')
  console.log('  andi@sadhana.com       — INTERN (Engineering)')
  console.log('  rina@sadhana.com       — INTERN (Design)')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())