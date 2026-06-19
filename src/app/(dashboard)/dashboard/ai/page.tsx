import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AiChatPage from '@/components/dashboard/AiChatPage'

export const metadata = {
  title: 'AI Insights — Sejiwa',
  description: 'Asisten AI cerdas untuk manajemen proyek Sejiwa',
}

export default async function AiPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <AiChatPage user={session.user} />
}
