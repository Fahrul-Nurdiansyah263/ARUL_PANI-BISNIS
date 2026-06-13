"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TicketColumn from "./TicketColumn";
import TicketCard from "./TicketCard";
import CreateTicketModal from "./CreateTicketModal";
import TicketDetailModal from "./TicketDetailModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

export type TicketStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "PRIORITY" | "DONE";

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  deadline?: string;
  assignee?: {
    id: string;
    name: string;
    role: string;
    position?: string | null;
    avatarUrl?: string;
    division?: { id: string; name: string; description: string | null };
  };
  createdBy: {
    id: string;
    name: string;
    role: string;
    position?: string | null;
    division?: { id: string; name: string; description: string | null };
  };
  division?: { id: string; name: string };
  _count: { comments: number };
  divisionId: string;
}

const COLUMNS: { id: TicketStatus; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "PRIORITY", label: "Priority" },
  { id: "DONE", label: "Done" },
];

interface Props {
  companyId: string;
  divisionId: string | null;
  role: string;
  userId: string;
}

export default function TicketBoard({
  companyId,
  divisionId,
  role,
  userId,
}: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCommentAdded = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? { ...t, _count: { ...t._count, comments: t._count.comments + 1 } }
          : t,
      ),
    );
    setSelectedTicket((prev) => {
      if (prev && prev.id === ticketId) {
        return {
          ...prev,
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1,
          },
        };
      }
      return prev;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const fetchTickets = useCallback(async () => {
    try {
      setError(null);
      const queryParams = new URLSearchParams();
      if (divisionId) queryParams.append("divisionId", divisionId);
      queryParams.append("limit", "100");
      const res = await fetch(`/api/tickets?${queryParams.toString()}`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memuat tickets");
      }

      const json = await res.json();
      // API sekarang return { data, pagination }
      setTickets(Array.isArray(json) ? json : json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [divisionId]);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [fetchTickets]);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;
    const newStatus = over.id as TicketStatus;

    if (!COLUMNS.find((c) => c.id === newStatus)) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) return;

    // Simpan status lama untuk rollback
    const oldStatus = ticket.status;

    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)),
    );

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Gagal mengupdate status ticket");
      }
    } catch {
      // Rollback on failure
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: oldStatus } : t,
        ),
      );
      setError("Gagal mengupdate status ticket. Perubahan dikembalikan.");
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const ticketsByStatus = (status: TicketStatus) =>
    tickets.filter((t) => t.status === status);

  const canCreate = hasPermission(role, "canCreateTicket");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Memuat tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      {canCreate && (
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-2" />
            Buat Ticket
          </Button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin min-h-[500px]">
          {COLUMNS.map((col) => (
            <div key={col.id} className="w-[280px] shrink-0">
              <TicketColumn
                id={col.id}
                label={col.label}
                tickets={ticketsByStatus(col.id)}
                role={role}
                onClick={(ticket) => setSelectedTicket(ticket)}
              />
            </div>
          ))}
        </div>

        <DragOverlay>
          {activeTicket && (
            <TicketCard ticket={activeTicket} role={role} overlay />
          )}
        </DragOverlay>
      </DndContext>

      {showModal && (
        <CreateTicketModal
          companyId={companyId}
          divisionId={divisionId}
          role={role}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchTickets();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={{ id: userId, role }}
          onClose={() => setSelectedTicket(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
