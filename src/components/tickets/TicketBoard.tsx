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
import { Plus, Bell, Activity, RefreshCw } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { supabase } from "@/lib/supabase";

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
  };
  createdBy: {
    id: string;
    name: string;
    role: string;
    position?: string | null;
  };
  project?: { id: string; name: string } | null;
  _count: { comments: number };
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
  role: string;
  userId: string;
  initialProjectId?: string;
}

export default function TicketBoard({
  companyId,
  role,
  userId,
  initialProjectId,
}: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || "all"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderNotification, setReminderNotification] = useState<string | null>(null);

  const handleSendDeadlineReminders = async () => {
    try {
      setSendingReminders(true);
      setReminderNotification(null);
      const res = await fetch("/api/tickets/deadline-reminders", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setReminderNotification(
          `✅ ${data.message} (${data.emailsSent} email pengingat terkirim)`
        );
      } else {
        setReminderNotification(`❌ Gagal: ${data.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      setReminderNotification("❌ Gagal terhubung ke server untuk mengirim pengingat.");
    } finally {
      setSendingReminders(false);
      setTimeout(() => setReminderNotification(null), 6000);
    }
  };

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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
      let url = `/api/tickets?limit=100`;
      if (selectedProjectId !== "all") {
        url += `&projectId=${selectedProjectId}`;
      }
      const res = await fetch(url);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal memuat tickets");
      }

      const json = await res.json();
      setTickets(Array.isArray(json) ? json : json.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat tickets");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetch("/api/projects?limit=100")
      .then((r) => r.json())
      .then((json) => {
        setProjects(Array.isArray(json) ? json : json.data ?? []);
      })
      .catch((err) => console.error("Gagal memuat projects", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTickets();
  }, [fetchTickets, selectedProjectId]);

  // Real-time Supabase Broadcast & Auto-Sync Polling
  useEffect(() => {
    const channelName = `company-${companyId}-tickets`;
    const channel = supabase.channel(channelName);

    channel
      .on("broadcast", { event: "tickets-changed" }, () => {
        fetchTickets();
      })
      .subscribe();

    // Auto-polling sync setiap 8 detik jika tab aktif
    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !activeTicket) {
        fetchTickets();
      }
    }, 8000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [companyId, fetchTickets, activeTicket]);

  const notifyRealtimeChange = useCallback(() => {
    try {
      supabase.channel(`company-${companyId}-tickets`).send({
        type: "broadcast",
        event: "tickets-changed",
        payload: { timestamp: Date.now() },
      });
    } catch (e) {
      console.warn("Realtime broadcast notice failed:", e);
    }
  }, [companyId]);

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = tickets.find((t) => t.id === event.active.id);
    if (ticket) setActiveTicket(ticket);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) return;

    const ticketId = active.id as string;

    // over.id bisa berupa column ID atau ticket ID
    // Jika drop di area kosong kolom → over.id = column ID (TicketStatus)
    // Jika drop di atas card lain → over.id = ticket ID, cari status dari ticket tsb
    let newStatus: TicketStatus;
    const isColumn = COLUMNS.find((c) => c.id === over.id);
    if (isColumn) {
      newStatus = over.id as TicketStatus;
    } else {
      // over.id adalah ticket ID — ambil status dari ticket target
      const overTicket = tickets.find((t) => t.id === over.id);
      if (!overTicket) return;
      newStatus = overTicket.status;
    }

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

      // Broadcast update ke semua anggota tim lain yang sedang membuka board
      notifyRealtimeChange();
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

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
              Filter:
            </span>
            <select
              className="px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-700 min-w-[180px]"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="all">Semua Proyek</option>
              <option value="unassigned">Tanpa Proyek</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Live Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-300"></span>
            </span>
            <span>LIVE SYNC</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendDeadlineReminders}
            disabled={sendingReminders}
            title="Kirim email pengingat untuk semua tiket yang mendekati deadline"
            className="h-7 px-2.5 text-xs border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-medium"
          >
            <Bell size={12} className={`mr-1.5 ${sendingReminders ? "animate-spin" : ""}`} />
            {sendingReminders ? "Mengirim..." : "Pengingat Deadline"}
          </Button>

          {canCreate && (
            <Button
              size="sm"
              onClick={() => setShowModal(true)}
              className="h-7 px-3 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
            >
              <Plus size={12} className="mr-1" />
              Buat Tiket
            </Button>
          )}
        </div>
      </div>

      {reminderNotification && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-zinc-900 text-zinc-300 text-xs border border-zinc-800">
          {reminderNotification}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Memuat tickets...</span>
          </div>
        </div>
      ) : (
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
      )}

      {showModal && (
        <CreateTicketModal
          companyId={companyId}
          role={role}
          defaultProjectId={selectedProjectId !== "all" && selectedProjectId !== "unassigned" ? selectedProjectId : undefined}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            fetchTickets();
            notifyRealtimeChange();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          currentUser={{ id: userId, role }}
          onClose={() => {
            setSelectedTicket(null);
            fetchTickets(); // Refresh board tickets after detail modal closes to pick up any changes
          }}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
