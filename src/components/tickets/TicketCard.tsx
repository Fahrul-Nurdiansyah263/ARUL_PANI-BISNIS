"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Ticket } from "./TicketBoard";
import { cn } from "@/lib/utils";
import { MessageSquare, Calendar } from "lucide-react";

interface Props {
  ticket: Ticket
  role: string
  overlay?: boolean
  onClick?: (ticket: Ticket) => void
}

export default function TicketCard({ ticket, role, overlay, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging) {
          onClick?.(ticket);
        }
      }}
      className={cn(
        "bg-zinc-950/90 rounded-lg p-3 border border-zinc-800/80 shadow-2xs cursor-pointer select-none hover:border-zinc-700 hover:bg-zinc-900/60 transition-all duration-150 space-y-2",
        isDragging && "opacity-40 cursor-grabbing",
        overlay && "shadow-xl rotate-1 border-zinc-500 bg-zinc-900"
      )}
    >
      {/* Title */}
      <p className="text-xs font-semibold leading-snug text-zinc-100 line-clamp-2">
        {ticket.title}
      </p>

      {/* Description */}
      {ticket.description && (
        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
          {ticket.description}
        </p>
      )}

      {/* Project & Assignee Info */}
      <div className="pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <div className="flex items-center gap-1.5 min-w-0">
          {ticket.assignee ? (
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-4 h-4 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center justify-center font-bold text-[9px] shrink-0">
                {ticket.assignee.name[0]?.toUpperCase()}
              </div>
              <span className="truncate max-w-[90px] text-zinc-400">
                {ticket.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-zinc-600">Unassigned</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ticket.deadline && (
            <div
              className="flex items-center gap-1 text-zinc-400"
              suppressHydrationWarning
            >
              <Calendar size={10} className="text-zinc-500" />
              <span>
                {new Date(ticket.deadline).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}

          {ticket._count.comments > 0 && (
            <div className="flex items-center gap-0.5 text-zinc-400">
              <MessageSquare size={10} className="text-zinc-500" />
              <span>{ticket._count.comments}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}