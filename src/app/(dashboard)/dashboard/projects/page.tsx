"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Info,
  Search,
  LayoutGrid,
  List as ListIcon,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CreateProjectModal from "@/components/projects/CreateProjectModal";
import EditProjectModal from "@/components/projects/EditProjectModal";
import DeleteProjectModal from "@/components/projects/DeleteProjectModal";
import ProjectDetailModal from "@/components/projects/ProjectDetailModal";

interface Project {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED";
  createdAt: string;
  _count: {
    tickets: number;
  };
}

type StatusFilter = "ALL" | "ACTIVE" | "ON_HOLD" | "COMPLETED";
type ViewMode = "grid" | "list";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects?limit=100");
      if (!res.ok) throw new Error("Gagal memuat daftar proyek");
      const json = await res.json();
      setProjects(Array.isArray(json) ? json : json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Gagal menghapus proyek");
      }
      setDeletingProject(null);
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const isOwner = session?.user?.role === "OWNER";

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Aktif
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-500">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Ditunda
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
            Selesai
          </span>
        );
      default:
        return null;
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "ALL" ? true : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const countByStatus = {
    ALL: projects.length,
    ACTIVE: projects.filter((p) => p.status === "ACTIVE").length,
    ON_HOLD: projects.filter((p) => p.status === "ON_HOLD").length,
    COMPLETED: projects.filter((p) => p.status === "COMPLETED").length,
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            Proyek
          </h1>
          <p className="text-[11px] text-muted-foreground">
            Kelola proyek dan workspace tim
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="h-8 px-3 text-xs gap-1.5 font-medium rounded-lg"
        >
          <Plus size={13} />
          <span>Proyek Baru</span>
        </Button>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Status Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-card border border-border shrink-0">
          {(
            [
              { id: "ALL", label: "Semua" },
              { id: "ACTIVE", label: "Aktif" },
              { id: "ON_HOLD", label: "Ditunda" },
              { id: "COMPLETED", label: "Selesai" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5",
                statusFilter === tab.id
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">
                {countByStatus[tab.id]}
              </span>
            </button>
          ))}
        </div>

        {/* Search & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              placeholder="Cari proyek..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-7 pr-2.5 text-[11px] rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center p-0.5 rounded-lg bg-card border border-border">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={cn(
                "p-1 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={cn(
                "p-1 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListIcon size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Loader2 className="animate-spin text-muted-foreground" size={18} />
          <p className="text-muted-foreground text-[11px]">Memuat proyek...</p>
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/10 rounded-xl p-4 text-center">
          <p className="text-destructive text-xs mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchProjects} className="h-7 text-xs">
            Coba Lagi
          </Button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center flex flex-col items-center justify-center gap-2 bg-card">
          <FolderKanban size={18} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            {search || statusFilter !== "ALL"
              ? "Tidak ada proyek yang sesuai."
              : "Belum ada proyek terdaftar."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= COMPACT SOLID GRID VIEW ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/projects/${p.id}`)}
              className="border border-border bg-card hover:border-foreground/30 rounded-xl p-3.5 transition-colors cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-7 h-7 rounded-md object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-muted text-foreground border border-border flex items-center justify-center font-bold text-[11px] shrink-0">
                        {p.name[0]?.toUpperCase()}
                      </div>
                    )}

                    <h3 className="font-semibold text-xs text-foreground truncate hover:underline">
                      {p.name}
                    </h3>
                  </div>

                  <div className="shrink-0">{getStatusBadge(p.status)}</div>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
                  {p.description || "Tidak ada deskripsi."}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2.5 border-t border-border flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Ticket size={11} className="opacity-70" />
                  <span>{p._count.tickets} tugas</span>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    title="Detail"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailProject(p);
                    }}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Info size={12} />
                  </button>

                  <button
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p);
                    }}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 size={12} />
                  </button>

                  {isOwner && (
                    <button
                      title="Hapus"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(p);
                      }}
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= COMPACT SOLID LIST VIEW ================= */
        <div className="border border-border bg-card rounded-xl overflow-hidden divide-y divide-border">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/projects/${p.id}`)}
              className="px-3 py-2 hover:bg-muted/50 flex items-center justify-between gap-3 cursor-pointer transition-colors text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-6 h-6 rounded-md object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-md bg-muted text-foreground border border-border flex items-center justify-center font-bold text-[10px] shrink-0">
                    {p.name[0]?.toUpperCase()}
                  </div>
                )}

                <span className="font-semibold text-xs text-foreground truncate max-w-[200px] sm:max-w-xs hover:underline">
                  {p.name}
                </span>

                {p.description && (
                  <span className="hidden md:inline text-[11px] text-muted-foreground truncate max-w-sm">
                    {p.description}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 shrink-0 text-[11px] text-muted-foreground">
                <div>{getStatusBadge(p.status)}</div>

                <span className="hidden sm:inline">{p._count.tickets} tugas</span>

                <div className="flex items-center gap-0.5">
                  <button
                    title="Detail"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailProject(p);
                    }}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Info size={12} />
                  </button>

                  <button
                    title="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(p);
                    }}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 size={12} />
                  </button>

                  {isOwner && (
                    <button
                      title="Hapus"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingProject(p);
                      }}
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          isOwner={isOwner}
          onClose={() => setDetailProject(null)}
          onEdit={() => setEditingProject(detailProject)}
          onDelete={() => setDeletingProject(detailProject)}
        />
      )}

      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            fetchProjects();
          }}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={() => {
            setEditingProject(null);
            fetchProjects();
          }}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          projectName={deletingProject.name}
          loading={deleting}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
