"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  CornerDownRight,
  BookOpen,
  Target,
  Compass,
  Code2,
  Calendar,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocItem {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  category: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count?: { children: number };
}

interface DocSidebarProps {
  projectName: string;
  docs: DocItem[];
  activeDocId: string | null;
  onSelectDoc: (docId: string) => void;
  onCreateDoc: (parentId?: string | null, category?: string) => void;
  onDeleteDoc: (docId: string) => void;
  loading: boolean;
}

export default function DocSidebar({
  projectName,
  docs,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onDeleteDoc,
  loading,
}: DocSidebarProps) {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper static Lucide icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "MARKETING":
        return Target;
      case "ROADMAP":
        return Compass;
      case "LOG":
        return Code2;
      case "MEETING_NOTES":
        return Calendar;
      case "DOCUMENTATION":
        return BookOpen;
      case "VISION":
        return Layers;
      default:
        return FileText;
    }
  };

  // Filter docs
  const filteredDocs = docs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  // Group top-level and children
  const rootDocs = filteredDocs.filter((d) => !d.parentId);
  const getChildren = (parentId: string) =>
    filteredDocs.filter((d) => d.parentId === parentId);

  const renderDocRow = (doc: DocItem, level: number = 0) => {
    const children = getChildren(doc.id);
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedIds[doc.id];
    const isActive = activeDocId === doc.id;
    const Icon = getCategoryIcon(doc.category);

    return (
      <div key={doc.id} className="space-y-0.5">
        <div
          onClick={() => onSelectDoc(doc.id)}
          style={{ paddingLeft: `${level * 14 + 10}px` }}
          className={cn(
            "group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150 relative",
            isActive
              ? "bg-accent/80 text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => toggleExpand(doc.id, e)}
                className="p-0.5 rounded hover:bg-background/80 text-muted-foreground hover:text-foreground shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
            ) : level > 0 ? (
              <CornerDownRight
                size={11}
                className="text-muted-foreground/50 shrink-0 ml-0.5 mr-0.5"
              />
            ) : (
              <span className="w-3.5" />
            )}

            <Icon size={14} className={cn("shrink-0", isActive ? "text-primary" : "text-muted-foreground/70")} />
            
            <span className="truncate flex-1 leading-snug">
              {doc.title || "Tanpa Judul"}
            </span>
          </div>

          {/* Quick Hover Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              title="Tambah Sub-halaman"
              onClick={(e) => {
                e.stopPropagation();
                onCreateDoc(doc.id);
                setExpandedIds((prev) => ({ ...prev, [doc.id]: true }));
              }}
              className="p-1 rounded hover:bg-background text-muted-foreground hover:text-foreground"
            >
              <Plus size={12} />
            </button>

            <button
              title="Hapus Halaman"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Hapus halaman "${doc.title}"?`)) {
                  onDeleteDoc(doc.id);
                }
              }}
              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Render nested children if expanded */}
        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {children.map((child) => renderDocRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-card/60 border-r flex flex-col h-full shrink-0 select-none">
      {/* Workspace Header */}
      <div className="p-3.5 border-b flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Workspace Proyek
          </div>
          <div className="font-semibold text-sm truncate text-foreground flex items-center gap-1.5 mt-0.5">
            <Folder size={15} className="text-primary shrink-0" />
            <span className="truncate">{projectName}</span>
          </div>
        </div>

        <button
          onClick={() => onCreateDoc(null)}
          title="Buat Halaman Baru"
          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-2.5 border-b">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Cari halaman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border/80 bg-background/80 focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Pages Navigation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Recents / Quick Actions */}
        <div>
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Daftar Halaman</span>
            <span className="text-[10px] bg-accent px-1.5 py-0.2 rounded font-normal">
              {docs.length}
            </span>
          </div>

          <div className="mt-1 space-y-0.5">
            {loading ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Memuat halaman...
              </div>
            ) : docs.length === 0 ? (
              <div className="py-8 text-center px-4">
                <FileText size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">Belum ada halaman.</p>
                <button
                  onClick={() => onCreateDoc(null)}
                  className="mt-2.5 text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Plus size={12} /> Buat Dokumen Pertama
                </button>
              </div>
            ) : (
              rootDocs.map((doc) => renderDocRow(doc, 0))
            )}
          </div>
        </div>
      </div>

      {/* Footer Quick New Page Button */}
      <div className="p-2.5 border-t bg-card/80">
        <button
          onClick={() => onCreateDoc(null)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-accent/50 text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
        >
          <Plus size={14} />
          <span>Halaman Baru</span>
        </button>
      </div>
    </aside>
  );
}
