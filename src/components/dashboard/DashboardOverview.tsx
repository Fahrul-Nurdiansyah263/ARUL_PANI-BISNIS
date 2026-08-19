"use client";

import Link from "next/link";
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Users,
  Plus,
  Sparkles,
  Ticket,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardOverviewProps {
  metrics: {
    projects: {
      total: number;
      active: number;
      completed: number;
    };
    tickets: {
      total: number;
      byStatus: {
        TODO: number;
        IN_PROGRESS: number;
        REVIEW: number;
        PRIORITY: number;
        DONE: number;
      };
      completionRate: number;
      urgentCount: number;
    };
    users: {
      total: number;
      active: number;
    };
    urgentTickets: {
      id: string;
      title: string;
      deadline: Date | string | null;
      status: string;
      assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
      project?: { id: string; name: string } | null;
    }[];
    recentProjects: {
      id: string;
      name: string;
      description: string | null;
      imageUrl: string | null;
      status: string;
      ticketsCount: number;
      docsCount: number;
      doneCount: number;
      progress: number;
    }[];
    recentTickets: {
      id: string;
      title: string;
      status: string;
      updatedAt: Date | string;
      assignee?: { id: string; name: string; avatarUrl?: string | null } | null;
      project?: { id: string; name: string } | null;
      createdBy?: { id: string; name: string } | null;
    }[];
  };
  userName: string;
  userRole: string;
}

export default function DashboardOverview({
  metrics,
  userName,
  userRole,
}: DashboardOverviewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
            TODO
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-200 bg-zinc-800 border border-zinc-700">
            IN PROGRESS
          </span>
        );
      case "REVIEW":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-300 bg-zinc-800/80 border border-zinc-700">
            REVIEW
          </span>
        );
      case "PRIORITY":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-950 bg-zinc-100">
            PRIORITY
          </span>
        );
      case "DONE":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-500 bg-zinc-900/60 border border-zinc-800/60 line-through">
            DONE
          </span>
        );
      default:
        return null;
    }
  };

  const todayFormatted = new Date().toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              {todayFormatted}
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
              {userRole}
            </span>
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-100">
            Overview Agensi — {userName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/ai">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5 font-medium rounded-md border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
            >
              <Sparkles size={12} className="text-zinc-400" />
              <span>AI Insights</span>
            </Button>
          </Link>
          <Link href="/dashboard/tickets">
            <Button
              size="sm"
              className="h-7 px-3 text-xs gap-1.5 font-medium rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold"
            >
              <Ticket size={12} />
              <span>Papan Tiket</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Linear Monochrome Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Projects */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium tracking-tight">Proyek Berjalan</span>
            <FolderKanban size={14} className="text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {metrics.projects.active}
              <span className="text-xs font-normal font-sans text-zinc-500 ml-1">
                / {metrics.projects.total}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {metrics.projects.completed} proyek telah selesai
            </p>
          </div>
        </div>

        {/* Card 2: Resolution Rate */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium tracking-tight">Penyelesaian Tugas</span>
            <TrendingUp size={14} className="text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {metrics.tickets.completionRate}%
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {metrics.tickets.byStatus.DONE} dari {metrics.tickets.total} tiket terselesaikan
            </p>
          </div>
        </div>

        {/* Card 3: Urgent / Critical */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium tracking-tight">Perlu Perhatian</span>
            <AlertTriangle size={14} className="text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {metrics.tickets.urgentCount}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Tiket mendesak (&lt; 24 jam)
            </p>
          </div>
        </div>

        {/* Card 4: Team Members */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-medium tracking-tight">Anggota Tim</span>
            <Users size={14} className="text-zinc-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono tracking-tight text-zinc-100">
              {metrics.users.active}
              <span className="text-xs font-normal font-sans text-zinc-500 ml-1">
                / {metrics.users.total}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              Staf agensi aktif
            </p>
          </div>
        </div>
      </div>

      {/* Task Distribution (Segmented Bar) */}
      <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-200">
            Distribusi Tiket Alur Kerja
          </span>
          <Link
            href="/dashboard/tickets"
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
          >
            <span>Buka Board</span>
            <ChevronRight size={12} />
          </Link>
        </div>

        {/* High-Precision Grayscale Segmented Track */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden flex border border-zinc-800/60">
          {metrics.tickets.total > 0 ? (
            <>
              <div
                style={{
                  width: `${(metrics.tickets.byStatus.TODO / metrics.tickets.total) * 100}%`,
                }}
                className="bg-zinc-700 transition-all"
                title={`TODO: ${metrics.tickets.byStatus.TODO}`}
              />
              <div
                style={{
                  width: `${(metrics.tickets.byStatus.IN_PROGRESS / metrics.tickets.total) * 100}%`,
                }}
                className="bg-zinc-500 transition-all"
                title={`IN PROGRESS: ${metrics.tickets.byStatus.IN_PROGRESS}`}
              />
              <div
                style={{
                  width: `${(metrics.tickets.byStatus.REVIEW / metrics.tickets.total) * 100}%`,
                }}
                className="bg-zinc-400 transition-all"
                title={`REVIEW: ${metrics.tickets.byStatus.REVIEW}`}
              />
              <div
                style={{
                  width: `${(metrics.tickets.byStatus.PRIORITY / metrics.tickets.total) * 100}%`,
                }}
                className="bg-zinc-100 transition-all"
                title={`PRIORITY: ${metrics.tickets.byStatus.PRIORITY}`}
              />
              <div
                style={{
                  width: `${(metrics.tickets.byStatus.DONE / metrics.tickets.total) * 100}%`,
                }}
                className="bg-zinc-800 transition-all border-r border-zinc-900"
                title={`DONE: ${metrics.tickets.byStatus.DONE}`}
              />
            </>
          ) : (
            <div className="w-full bg-zinc-800" />
          )}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
            <span className="text-zinc-400">To Do</span>
            <span className="font-mono font-semibold text-zinc-100">
              {metrics.tickets.byStatus.TODO}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
            <span className="text-zinc-400">In Progress</span>
            <span className="font-mono font-semibold text-zinc-100">
              {metrics.tickets.byStatus.IN_PROGRESS}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
            <span className="text-zinc-400">Review</span>
            <span className="font-mono font-semibold text-zinc-100">
              {metrics.tickets.byStatus.REVIEW}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
            <span className="text-zinc-400">Priority</span>
            <span className="font-mono font-semibold text-zinc-100">
              {metrics.tickets.byStatus.PRIORITY}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/80">
            <span className="text-zinc-400">Done</span>
            <span className="font-mono font-semibold text-zinc-100">
              {metrics.tickets.byStatus.DONE}
            </span>
          </div>
        </div>
      </div>

      {/* 2 Columns: Recent Projects & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Recent Projects */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              Proyek & Workspace Terkini
            </span>
            <Link
              href="/dashboard/projects"
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              <span>Semua Proyek</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {metrics.recentProjects.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                Belum ada proyek dibuat.
              </div>
            ) : (
              metrics.recentProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/dashboard/projects/${p.id}`}
                  className="block p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/80 hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-xs text-zinc-200 truncate group-hover:text-zinc-100 transition-colors">
                          {p.name}
                        </h4>
                        <ArrowUpRight
                          size={11}
                          className="text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5 font-mono">
                        <span>{p.ticketsCount} tugas</span>
                        <span>•</span>
                        <span>{p.docsCount} dokumen</span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {p.progress}%
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${p.progress}%` }}
                      className="h-full bg-zinc-300 rounded-full transition-all"
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Urgent Tasks */}
        <div className="border border-zinc-800/80 bg-zinc-900/40 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200">
              Tugas Mendekati Batas Waktu
            </span>
            <Link
              href="/dashboard/tickets"
              className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors"
            >
              <span>Board</span>
              <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-2">
            {metrics.urgentTickets.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                Tidak ada tiket kritis saat ini.
              </div>
            ) : (
              metrics.urgentTickets.map((t) => {
                const deadlineDate = t.deadline ? new Date(t.deadline) : null;
                const isOverdue = deadlineDate && deadlineDate.getTime() < Date.now();

                return (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900/80 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-xs text-zinc-200 truncate">
                          {t.title}
                        </span>
                        {getStatusBadge(t.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                        {t.project && <span className="truncate">{t.project.name}</span>}
                        {t.assignee && (
                          <>
                            <span>•</span>
                            <span className="truncate text-zinc-400">PIC: {t.assignee.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400 shrink-0">
                      {isOverdue ? "TERLEWAT" : "URGENT"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
