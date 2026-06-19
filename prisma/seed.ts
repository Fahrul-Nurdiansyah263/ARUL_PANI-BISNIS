import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sejiwa Agency...')

  // Reset data sebelum seeding
  await db.ticketComment.deleteMany()
  await db.ticket.deleteMany()
  await db.user.deleteMany()
  await db.company.deleteMany()

  // Buat agency
  const company = await db.company.create({
    data: {
      name: 'Sejiwa Agency',
      slug: 'sejiwa-agency',
    },
  })

  // Hash password
  const password = await bcrypt.hash('password123', 12)

  // Owner
  const owner = await db.user.create({
    data: {
      name: 'Fahrul Nurdiansyah',
      email: 'fahrul@sejiwa.agency',
      passwordHash: password,
      role: 'OWNER',
      position: 'Creative Director',
      companyId: company.id,
    },
  })

  // Anggota tim
  const member1 = await db.user.create({
    data: { name: 'Rina Kusuma', email: 'rina@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Branding', companyId: company.id },
  })
  const member2 = await db.user.create({
    data: { name: 'Budi Santoso', email: 'budi@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Content Writer', companyId: company.id },
  })
  const member3 = await db.user.create({
    data: { name: 'Andi Pratama', email: 'andi@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Frontend Developer', companyId: company.id },
  })
  const member4 = await db.user.create({
    data: { name: 'Sari Dewi', email: 'sari@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Social Media', companyId: company.id },
  })
  const member5 = await db.user.create({
    data: { name: 'Rizky Pratama', email: 'rizky@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Graphic Designer', companyId: company.id },
  })
  const member6 = await db.user.create({
    data: { name: 'Dewi Lestari', email: 'dewi@sejiwa.agency', passwordHash: password, role: 'MEMBER', position: 'Copywriter', companyId: company.id },
  })

  // Buat tickets
  const ticketData = [
    { title: 'Redesign logo klien A', description: 'Update logo sesuai brief terbaru dari klien', status: 'IN_PROGRESS', assigneeId: member1.id },
    { title: 'Brand guideline dokumen', description: 'Buat dokumen panduan brand lengkap', status: 'TODO', assigneeId: member1.id },
    { title: 'Konten Instagram Mei', description: 'Desain 12 post untuk kampanye bulan Mei', status: 'REVIEW', assigneeId: member2.id },
    { title: 'Email newsletter Q2', description: 'Kirim newsletter Q2 ke subscribers', status: 'DONE', assigneeId: member4.id },
    { title: 'Riset kompetitor digital', description: 'Analisis strategi konten kompetitor utama', status: 'TODO', assigneeId: member2.id },
    { title: 'Landing page klien B', description: 'Buat landing page kampanye produk baru', status: 'IN_PROGRESS', assigneeId: member3.id },
    { title: 'Setup Google Analytics', description: 'Pasang dan konfigurasi GA4 di semua properti', status: 'DONE', assigneeId: member3.id },
    { title: 'Optimasi SEO website agency', description: 'Audit dan perbaiki SEO on-page', status: 'TODO', assigneeId: member3.id },
    { title: 'Proposal pitch deck klien C', description: 'Siapkan deck presentasi untuk pitch bulan depan', status: 'IN_PROGRESS', assigneeId: member1.id },
    { title: 'Video reels konten', description: 'Produksi 4 video reels untuk klien D', status: 'TODO', assigneeId: member4.id },
  ]

  for (const ticket of ticketData) {
    await db.ticket.create({
      data: {
        ...ticket,
        companyId: company.id,
        createdById: owner.id,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: ticket.status as any,
      },
    })
  }

  console.log('✅ Seeding selesai!')
  console.log('')
  console.log('📋 Akun tersedia (password: password123):')
  console.log('  fahrul@sejiwa.agency  — OWNER (Creative Director)')
  console.log('  rina@sejiwa.agency    — MEMBER (Branding)')
  console.log('  budi@sejiwa.agency    — MEMBER (Content Writer)')
  console.log('  andi@sejiwa.agency    — MEMBER (Frontend Developer)')
  console.log('  sari@sejiwa.agency    — MEMBER (Social Media)')
  console.log('  rizky@sejiwa.agency   — MEMBER (Graphic Designer)')
  console.log('  dewi@sejiwa.agency    — MEMBER (Copywriter)')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())