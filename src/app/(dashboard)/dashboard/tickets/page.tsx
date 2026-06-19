import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TicketBoard from '@/components/tickets/TicketBoard'

export default async function TicketsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tickets</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola dan track progress task tim kamu
          </p>
        </div>
      </div>
      <TicketBoard
        companyId={session.user.companyId}
        role={session.user.role}
        userId={session.user.id}
      />
    </div>
  )
}