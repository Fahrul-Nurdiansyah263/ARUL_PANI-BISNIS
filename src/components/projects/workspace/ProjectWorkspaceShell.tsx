"use client";

import { useState, useEffect, useCallback } from "react";
import DocSidebar, { DocItem } from "./DocSidebar";
import DocEditorCanvas, { DocDetail } from "./DocEditorCanvas";
import { Loader2, FileText, Plus } from "lucide-react";

interface ProjectWorkspaceShellProps {
  projectId: string;
  projectName: string;
  role: string;
}

export default function ProjectWorkspaceShell({
  projectId,
  projectName,
  role,
}: ProjectWorkspaceShellProps) {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<DocDetail | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all docs for this project
  const fetchDocs = useCallback(async (selectDocId?: string) => {
    try {
      setLoadingDocs(true);
      const res = await fetch(`/api/projects/${projectId}/docs`);
      if (!res.ok) throw new Error("Gagal memuat dokumen proyek");
      const json: DocItem[] = await res.json();
      setDocs(json);

      // If specific docId requested or no active doc, select first doc or requested
      if (selectDocId) {
        setActiveDocId(selectDocId);
      } else if (json.length > 0 && !activeDocId) {
        setActiveDocId(json[0].id);
      } else if (json.length === 0) {
        setActiveDocId(null);
        setActiveDoc(null);
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat dokumen");
    } finally {
      setLoadingDocs(false);
    }
  }, [projectId, activeDocId]);

  // Fetch single active doc detail
  const fetchDocDetail = useCallback(
    async (docId: string) => {
      try {
        setLoadingDetail(true);
        const res = await fetch(`/api/projects/${projectId}/docs/${docId}`);
        if (!res.ok) throw new Error("Gagal memuat detail dokumen");
        const json: DocDetail = await res.json();
        setActiveDoc(json);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoadingDetail(false);
      }
    },
    [projectId]
  );

  // Initial load
  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Load detail when activeDocId changes
  useEffect(() => {
    if (activeDocId) {
      fetchDocDetail(activeDocId);
    }
  }, [activeDocId, fetchDocDetail]);

  // Create new doc
  const handleCreateDoc = async (parentId?: string | null, category?: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Halaman Baru",
          parentId: parentId || null,
          category: category || "GENERAL",
          content: "",
        }),
      });

      if (!res.ok) throw new Error("Gagal membuat halaman");
      const createdDoc: DocDetail = await res.json();

      // Refresh doc list and select the newly created doc
      await fetchDocs(createdDoc.id);
    } catch (err: any) {
      alert(err.message || "Error saat membuat dokumen");
    }
  };

  // Update doc (debounced from canvas)
  const handleUpdateDoc = async (
    docId: string,
    data: Partial<DocDetail>
  ) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Gagal menyimpan perubahan");
      const updated: DocDetail = await res.json();

      // Update local sidebar title/category
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                title: updated.title,
                category: updated.category,
                updatedAt: updated.updatedAt,
              }
            : d
        )
      );

      setActiveDoc((prev) => (prev && prev.id === docId ? { ...prev, ...updated } : prev));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  // Delete doc
  const handleDeleteDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/docs/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus dokumen");

      // Filter out deleted doc
      const remaining = docs.filter((d) => d.id !== docId && d.parentId !== docId);
      setDocs(remaining);

      if (activeDocId === docId) {
        if (remaining.length > 0) {
          setActiveDocId(remaining[0].id);
        } else {
          setActiveDocId(null);
          setActiveDoc(null);
        }
      }
    } catch (err: any) {
      alert(err.message || "Error saat menghapus dokumen");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] border rounded-2xl overflow-hidden bg-card shadow-sm">
      {/* Notion-style Left Sidebar */}
      <DocSidebar
        projectName={projectName}
        docs={docs}
        activeDocId={activeDocId}
        onSelectDoc={(id) => setActiveDocId(id)}
        onCreateDoc={handleCreateDoc}
        onDeleteDoc={handleDeleteDoc}
        loading={loadingDocs}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {loadingDetail ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <p className="text-xs text-muted-foreground">Membuka dokumen...</p>
          </div>
        ) : activeDoc ? (
          <DocEditorCanvas
            projectName={projectName}
            doc={activeDoc}
            onUpdateDoc={handleUpdateDoc}
            onDeleteDoc={handleDeleteDoc}
            onSelectDoc={(id) => setActiveDocId(id)}
            onCreateSubDoc={(parentId) => handleCreateDoc(parentId)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground/60 mb-3 border">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-lg text-foreground">Workspace Dokumen Kosong</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
              Belum ada halaman di dalam proyek ini. Mulai buat catatan strategi marketing, brief desain, atau dev log.
            </p>
            <button
              onClick={() => handleCreateDoc(null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus size={14} />
              Buat Halaman Pertama
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
