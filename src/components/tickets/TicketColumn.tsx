"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TicketCard from "./TicketCard";
import { Ticket, TicketStatus } from "./TicketBoard";
import { cn } from "@/lib/utils";

interface Props {
  id: TicketStatus;
  label: string;
  tickets: Ticket[];
  role: string;
  onClick?: (ticket: Ticket) => void;
}

export default function TicketColumn({
  id,
  label,
  tickets,
  role,
  onClick,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-xl p-2.5 min-h-[520px] transition-colors border border-zinc-800/80 bg-zinc-900/30 flex flex-col",
        isOver && "ring-1 ring-zinc-500 bg-zinc-900/60"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider font-mono">
            {label}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 rounded px-1.5 py-0.2">
          {tickets.length}
        </span>
      </div>

      <SortableContext
        items={tickets.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 flex-1">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              role={role}
              onClick={onClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}