"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  KanbanSquare,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ProjectWorkspaceShell from "@/components/projects/workspace/ProjectWorkspaceShell";
import TicketBoard from "@/components/tickets/TicketBoard";

interface ProjectDetailViewProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    status: "ACTIVE" | "ON_HOLD" | "COMPLETED";
    ticketsCount: number;
    docsCount: number;
  };
  sessionUser: {
    id: string;
    role: string;
    companyId: string;
  };
}

export default function ProjectDetailView({
  project,
  sessionUser,
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"workspace" | "board">("workspace");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Aktif
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Ditunda
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/projects"
            className="p-2 rounded-xl border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Kembali ke Daftar Proyek"
          >
            <ArrowLeft size={16} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              {getStatusBadge(project.status)}
            </div>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate max-w-xl mt-0.5">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-muted/60 border shrink-0">
          <button
            onClick={() => setActiveTab("workspace")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "workspace"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen size={14} className={activeTab === "workspace" ? "text-primary" : ""} />
            <span>Workspace Dokumen</span>
          </button>

          <button
            onClick={() => setActiveTab("board")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
              activeTab === "board"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <KanbanSquare size={14} className={activeTab === "board" ? "text-primary" : ""} />
            <span>Board Tiket ({project.ticketsCount})</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div>
        {activeTab === "workspace" ? (
          <ProjectWorkspaceShell
            projectId={project.id}
            projectName={project.name}
            role={sessionUser.role}
          />
        ) : (
          <div className="pt-2">
            <TicketBoard
              companyId={sessionUser.companyId}
              role={sessionUser.role}
              userId={sessionUser.id}
              initialProjectId={project.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
