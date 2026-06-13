'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import TicketCard from './TicketCard'
import { Ticket, TicketStatus } from './TicketBoard'
import { cn } from '@/lib/utils'

const colorMap: Record<TicketStatus, string> = {
  TODO: 'bg-slate-100 dark:bg-slate-800',
  IN_PROGRESS: 'bg-blue-50 dark:bg-blue-950',
  REVIEW: 'bg-yellow-50 dark:bg-yellow-950',
  PRIORITY: 'bg-purple-50 dark:bg-purple-950',
  DONE: 'bg-green-50 dark:bg-green-950',
}

const dotMap: Record<TicketStatus, string> = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  REVIEW: 'bg-yellow-500',
  PRIORITY: 'bg-purple-500',
  DONE: 'bg-green-500',
}

interface Props {
  id: TicketStatus
  label: string
  tickets: Ticket[]
  role: string
  onClick?: (ticket: Ticket) => void
}

export default function TicketColumn({ id, label, tickets, role, onClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl p-3 min-h-[500px] transition-colors',
        colorMap[id],
        isOver && 'ring-2 ring-primary'
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('w-2 h-2 rounded-full', dotMap[id])} />
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {tickets.length}
        </span>
      </div>

      <SortableContext items={tickets.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} role={role} onClick={onClick} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}