import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Sejiwa Agency...')

  // Reset data sebelum seeding
  await db.ticketComment.deleteMany()
  await db.ticket.deleteMany()
  await db.project.deleteMany()
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

  // Buat projects
  const projectA = await db.project.create({
    data: { name: 'Brand Identity - Kopikalyan', description: 'Proyek perancangan ulang identitas visual, moodboard, brand guidelines, serta mockup packaging cup untuk Kopikalyan cabang baru.', companyId: company.id }
  })
  const projectB = await db.project.create({
    data: { name: 'Website Campaign - Tiket.com', description: 'Pembuatan landing page kampanye promo liburan tengah tahun Tiket.com beserta integrasi analitik dan optimasi performa.', companyId: company.id }
  })
  const projectC = await db.project.create({
    data: { name: 'Social Media - Somethinc', description: 'Penyusunan rencana konten bulanan, copywriting naskah, produksi video reels/shorts, serta pelaporan bulanan Somethinc.', companyId: company.id }
  })
  const projectD = await db.project.create({
    data: { name: 'Pitch Proposal - Mandiri Prioritas', description: 'Penyusunan riset kompetitor digital dan desain proposal deck presentasi kreatif untuk Mandiri Prioritas.', companyId: company.id }
  })

  // Buat tickets
  const ticketData = [
    { title: 'Redesign logo & moodboard Kopikalyan', description: 'Update logo sesuai brief minimalis Kopikalyan cabang baru dan susun moodboard visual.', status: 'IN_PROGRESS', assigneeId: member1.id, projectId: projectA.id },
    { title: 'Dokumen panduan brand guidelines', description: 'Buat dokumen PDF panduan brand lengkap mencakup tipografi, palette warna, dan larangan penggunaan logo.', status: 'REVIEW', assigneeId: member1.id, projectId: projectA.id },
    { title: 'Desain mockup packaging cup & sleeves', description: 'Buat visual mockup packaging cup kopi panas dan dingin dengan branding baru.', status: 'TODO', assigneeId: member5.id, projectId: projectA.id },
    
    { title: 'Slicing landing page promo Tiket.com', description: 'Slicing UI design dari Figma ke Next.js & Tailwind CSS. Pastikan responsive dan performansi tinggi.', status: 'IN_PROGRESS', assigneeId: member3.id, projectId: projectB.id },
    { title: 'Setup Google Analytics 4 & FB Pixel', description: 'Pasang dan konfigurasi tag tracking GA4 dan Pixel untuk kampanye iklan liburan.', status: 'DONE', assigneeId: member3.id, projectId: projectB.id },
    { title: 'Audit & optimasi SEO on-page microsite', description: 'Audit meta tags, open graph, alt images, dan page speed load landing page Tiket.com.', status: 'TODO', assigneeId: member3.id, projectId: projectB.id },
    
    { title: 'Content plan Instagram Somethinc Juli', description: 'Penyusunan kalender konten feed dan story untuk kampanye peluncuran serum baru.', status: 'REVIEW', assigneeId: member2.id, projectId: projectC.id },
    { title: 'Copywriting brief video TikTok Somethinc', description: 'Tulis naskah skrip video review skincare routine Somethinc untuk talent/KOL.', status: 'TODO', assigneeId: member6.id, projectId: projectC.id },
    { title: 'Produksi video Reels & TikTok Shorts', description: 'Syuting asset footage produk serum dan editing video transisi estetik.', status: 'IN_PROGRESS', assigneeId: member4.id, projectId: projectC.id },
    { title: 'Report bulanan data engagement Mei', description: 'Analisis performa konten, insight jangkauan, dan data engagement rate akun Somethinc bulan Mei.', status: 'DONE', assigneeId: member4.id, projectId: projectC.id },
    
    { title: 'Riset kompetitor digital wealth management', description: 'Analisis strategi visual, positioning, dan komunikasi kompetitor perbankan prioritas lainnya.', status: 'TODO', assigneeId: member2.id, projectId: projectD.id },
    { title: 'Desain Pitch Deck Mandiri Prioritas', description: 'Layout deck proposal presentasi menggunakan style premium, clean, dan warna emas khas Mandiri.', status: 'IN_PROGRESS', assigneeId: member5.id, projectId: projectD.id },
  ]

  for (const ticket of ticketData) {
    await db.ticket.create({
      data: {
        title: ticket.title,
        description: ticket.description,
        status: ticket.status as any,
        assigneeId: ticket.assigneeId,
        projectId: ticket.projectId,
        companyId: company.id,
        createdById: owner.id,
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
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