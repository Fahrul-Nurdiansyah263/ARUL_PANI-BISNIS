import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold">Selamat datang, {session.user.name}!</h1>
      <p className="text-muted-foreground mt-1">Role: {session.user.role}</p>
    </div>
  )
}