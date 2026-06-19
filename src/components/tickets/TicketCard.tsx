'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Ticket } from './TicketBoard'
import { cn } from '@/lib/utils'
import { MessageSquare, Calendar, User } from 'lucide-react'

interface Props {
  ticket: Ticket
  role: string
  overlay?: boolean
  onClick?: (ticket: Ticket) => void
}

export default function TicketCard({ ticket, role, overlay, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ticket.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) {
          onClick?.(ticket)
        }
      }}
      className={cn(
        'bg-card rounded-lg p-3 border shadow-sm cursor-pointer select-none hover:border-primary/40 hover:shadow-md transition-all duration-200',
        isDragging && 'opacity-40 cursor-grabbing',
        overlay && 'shadow-xl rotate-1'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold leading-snug text-foreground/90">{ticket.title}</p>
      </div>

      {ticket.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      )}

      {/* Info Pembuat & Assignee */}
      <div className="mb-3 pt-2 border-t border-dashed border-border/80 flex flex-col gap-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-muted-foreground/80">Pembuat:</span>
          <span className="text-foreground/80 font-medium">{ticket.createdBy.name}</span>
          {ticket.createdBy.position && (
            <span className="text-[10px] text-muted-foreground/70">
              ({ticket.createdBy.position})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-medium text-muted-foreground/80">Ditugaskan:</span>
          <span className="text-foreground/80 font-medium">
            {ticket.assignee ? (
              <>
                {ticket.assignee.name}{' '}
                {ticket.assignee.position && (
                  <span className="text-[10px] text-muted-foreground/70">
                    ({ticket.assignee.position})
                  </span>
                )}
              </>
            ) : (
              'Belum ditugaskan'
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2">
          {ticket.assignee && (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
              {ticket.assignee.name[0]}
            </div>
          )}
          {ticket.deadline && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground" suppressHydrationWarning>
              <Calendar size={11} className="text-muted-foreground/70" />
              {new Date(ticket.deadline).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <MessageSquare size={11} className="text-muted-foreground/70" />
          <span>{ticket._count.comments}</span>
        </div>
      </div>
    </div>
  )
}