"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Loader2,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Folder,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DocDetail {
  id: string;
  projectId: string;
  parentId: string | null;
  title: string;
  category: string;
  coverUrl: string | null;
  content: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  parent?: { id: string; title: string } | null;
  children?: {
    id: string;
    title: string;
    category: string;
    order: number;
    createdAt: string;
    updatedAt: string;
  }[];
  createdBy?: { id: string; name: string; avatarUrl?: string | null };
}

interface DocEditorCanvasProps {
  projectName: string;
  doc: DocDetail;
  onUpdateDoc: (docId: string, data: Partial<DocDetail>) => Promise<void>;
  onDeleteDoc: (docId: string) => void;
  onSelectDoc: (docId: string) => void;
  onCreateSubDoc: (parentId: string) => void;
}

const CATEGORIES = [
  { id: "GENERAL", label: "General Note" },
  { id: "MARKETING", label: "Marketing" },
  { id: "ROADMAP", label: "Roadmap" },
  { id: "DOCUMENTATION", label: "Dokumentasi" },
  { id: "LOG", label: "Dev Log & Changelog" },
  { id: "VISION", label: "Vision & Goals" },
  { id: "MEETING_NOTES", label: "Meeting Notes" },
];

const TEMPLATES: Record<string, { title: string; content: string }> = {
  marketing: {
    title: "Marketing & Growth Strategy",
    content: `## 🎯 1. Target Audience & Objective
Menentukan target audiens utama dan tujuan kampanye pemasaran kuartal ini.

## 📢 2. Kanal Distribusi & Kampanye
- [ ] Riset konten kompetitor
- [ ] Optimasi copywriting landing page
- [ ] Jadwal posting konten Instagram & LinkedIn mingguan
- [ ] Kampanye Meta Ads & Google Ads

## 📊 3. Key Performance Indicators (KPI)
- Target Reach / Impresi: 50.000+
- Konversi Leads: 15%
- CPA (Cost Per Acquisition) di bawah batas anggaran.`,
  },
  devlog: {
    title: "Development Log & Changelog",
    content: `## 🛠️ Sprint Log & Perubahan Fitur

### [v1.0.0] - ${new Date().toLocaleDateString("id-ID")}
**Fitur Baru:**
- [x] Setup autentikasi RBAC & Role member
- [x] Integrasi Supabase Storage untuk upload gambar
- [x] Implementasi Workspace Dokumen ala Notion

**Bug Fixes & Improvement:**
- Optimasi kecepatan load query database
- Penyesuaian layout responsive pada tampilan mobile.`,
  },
  meeting: {
    title: `Notulensi Meeting - ${new Date().toLocaleDateString("id-ID")}`,
    content: `**Peserta:** Seluruh Tim Arul-Pani
**Agenda:** Evaluasi progress mingguan dan pembagian tugas sprint baru.

## 📝 Poin Pembahasan
1. Evaluasi tiket yang masih berstatus REVIEW.
2. Penyesuaian timeline deadline proyek klien.
3. Alur koordinasi materi marketing dan kreatif.

## ✅ Action Items & Penanggung Jawab
- [ ] Selesaikan revisi banner cover klien (PIC: Tim Desain)
- [ ] QA test fitur email pengingat (PIC: Tim Dev)
- [ ] Follow up feedback dari klien (PIC: Project Lead)`,
  },
  vision: {
    title: "Vision, Mission & Roadmap",
    content: `> *"Building impactful digital solutions with great craft and strong collaboration."*

## 🌟 Visi Utama
Membangun platform agensi yang efisien, transparan, dan mampu mengelola seluruh siklus proyek dari awal hingga rilis.

## 🗺️ Roadmap Milestone
- **Fase 1**: Core Project Management & Task Board
- **Fase 2**: Notion-like Workspace & Dokumentasi
- **Fase 3**: Integrasi AI Assistant & Otomasi Email
- **Fase 4**: Analitik Produktivitas Tim Komprehensif`,
  },
};

export default function DocEditorCanvas({
  projectName,
  doc,
  onUpdateDoc,
  onDeleteDoc,
  onSelectDoc,
  onCreateSubDoc,
}: DocEditorCanvasProps) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content || "");
  const [category, setCategory] = useState(doc.category || "GENERAL");
  const [coverUrl, setCoverUrl] = useState<string | null>(doc.coverUrl || null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("saved");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Sync state when doc changes
  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content || "");
    setCategory(doc.category || "GENERAL");
    setCoverUrl(doc.coverUrl || null);
    setSaveStatus("saved");
  }, [doc.id]);

  // Debounced Autosave
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(
    (newTitle: string, newContent: string, newCategory: string, newCoverUrl: string | null) => {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await onUpdateDoc(doc.id, {
            title: newTitle || "Tanpa Judul",
            content: newContent,
            category: newCategory,
            coverUrl: newCoverUrl,
          });
          setSaveStatus("saved");
        } catch (err) {
          console.error("Autosave error:", err);
          setSaveStatus("idle");
        }
      }, 700);
    },
    [doc.id, onUpdateDoc]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    triggerAutosave(val, content, category, coverUrl);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    triggerAutosave(title, val, category, coverUrl);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    triggerAutosave(title, content, val, coverUrl);
  };

  // Upload Cover Image via Supabase
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah banner cover");
      const json = await res.json();
      setCoverUrl(json.url);
      triggerAutosave(title, content, category, json.url);
    } catch (err: any) {
      alert(err.message || "Error saat upload banner");
    } finally {
      setUploadingCover(false);
    }
  };

  // Insert format helper
  const insertFormat = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    const replacement = `${prefix}${selected || "teks"}${suffix}`;
    const nextText =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    setContent(nextText);
    triggerAutosave(title, nextText, category, coverUrl);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 50);
  };

  // Insert Image to Content
  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Gagal mengunggah gambar");
      const json = await res.json();

      const imageMarkdown = `\n![${file.name}](${json.url})\n`;
      const textarea = textareaRef.current;
      const start = textarea ? textarea.selectionStart : content.length;
      const nextText =
        content.substring(0, start) + imageMarkdown + content.substring(start);

      setContent(nextText);
      triggerAutosave(title, nextText, category, coverUrl);
    } catch (err: any) {
      alert(err.message || "Error saat upload gambar");
    } finally {
      setUploadingImage(false);
    }
  };

  // Apply Template
  const applyTemplate = (key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;

    if (content && !confirm("Menerapkan template akan mengganti isi dokumen saat ini. Lanjutkan?")) {
      return;
    }

    setTitle(t.title);
    setContent(t.content);
    triggerAutosave(t.title, t.content, category, coverUrl);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="h-12 border-b px-6 flex items-center justify-between gap-4 bg-background/80 backdrop-blur-xs shrink-0 select-none">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <Folder size={13} className="shrink-0 text-primary" />
          <span className="truncate">{projectName}</span>
          {doc.parent && (
            <>
              <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
              <button
                onClick={() => onSelectDoc(doc.parent!.id)}
                className="hover:text-foreground truncate transition-colors"
              >
                {doc.parent.title}
              </button>
            </>
          )}
          <ChevronRight size={12} className="shrink-0 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {title || "Tanpa Judul"}
          </span>
        </div>

        {/* Right Actions & Sync Status */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Autosave Status */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {saveStatus === "saving" ? (
              <>
                <Loader2 size={12} className="animate-spin text-primary" />
                <span>Menyimpan...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>Tersimpan</span>
              </>
            ) : (
              <>
                <Clock size={12} />
                <span>Belum disimpan</span>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Category Select */}
          <div className="flex items-center gap-1">
            <Tag size={12} className="text-muted-foreground" />
            <select
              value={category}
              onChange={handleCategoryChange}
              className="text-xs bg-accent/40 border border-border/80 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground font-medium"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onCreateSubDoc(doc.id)}
            title="Tambah Sub-halaman"
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-accent hover:bg-accent/80 text-foreground transition-colors"
          >
            <Plus size={12} />
            <span>Sub-page</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Hapus halaman "${title}"?`)) {
                onDeleteDoc(doc.id);
              }
            }}
            title="Hapus Halaman Ini"
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Canvas Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Cover Banner Area */}
        <div className="relative group">
          {coverUrl ? (
            <div className="w-full h-44 md:h-52 bg-muted/40 relative overflow-hidden">
              <img
                src={coverUrl}
                alt="Doc Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 bg-black/70 backdrop-blur-xs rounded-lg p-1">
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded font-medium"
                >
                  Ganti Cover
                </button>
                <button
                  onClick={() => {
                    setCoverUrl(null);
                    triggerAutosave(title, content, category, null);
                  }}
                  className="px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 rounded font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-8 pt-4 pb-0 flex items-center justify-end">
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity py-1 px-2 rounded hover:bg-accent"
              >
                {uploadingCover ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <ImageIcon size={13} />
                )}
                <span>+ Tambah Cover Banner</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={coverInputRef}
            onChange={handleCoverUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleInsertImage}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Notion Canvas Body */}
        <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
          {/* Inline Editable Big Title */}
          <div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Nama Halaman..."
              className="w-full text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40"
            />
          </div>

          {/* Embedded Sub-Pages Section (Like Notion Child Pages) */}
          {doc.children && doc.children.length > 0 && (
            <div className="border border-border/70 rounded-xl p-3.5 bg-card/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Sub-Halaman di dalam dokumen ini ({doc.children.length})</span>
                <button
                  onClick={() => onCreateSubDoc(doc.id)}
                  className="text-primary hover:underline flex items-center gap-1 text-xs"
                >
                  <Plus size={11} /> Tambah
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {doc.children.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => onSelectDoc(child.id)}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border/80 bg-background/90 hover:bg-accent/60 hover:border-primary/40 cursor-pointer transition-all duration-150 group shadow-2xs"
                  >
                    <FileText size={15} className="text-primary shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-medium truncate text-card-foreground flex-1">
                      {child.title || "Tanpa Judul"}
                    </span>
                    <ChevronRight size={12} className="text-muted-foreground/60 group-hover:text-foreground shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Formatting Toolbar */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xs border rounded-xl p-1.5 flex flex-wrap items-center gap-1 text-muted-foreground shadow-xs">
            <button
              title="Heading 1 (#)"
              onClick={() => insertFormat("\n# ", "\n")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold"
            >
              <Heading1 size={15} />
            </button>
            <button
              title="Heading 2 (##)"
              onClick={() => insertFormat("\n## ", "\n")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold"
            >
              <Heading2 size={15} />
            </button>
            <button
              title="Heading 3 (###)"
              onClick={() => insertFormat("\n### ", "\n")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold"
            >
              <Heading3 size={15} />
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              title="Tebal (**teks**)"
              onClick={() => insertFormat("**", "**")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <Bold size={14} />
            </button>
            <button
              title="Miring (*teks*)"
              onClick={() => insertFormat("*", "*")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <Italic size={14} />
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              title="To-do Checklist (- [ ])"
              onClick={() => insertFormat("\n- [ ] ", "")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <CheckSquare size={14} />
            </button>
            <button
              title="Bullet List (- )"
              onClick={() => insertFormat("\n- ", "")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <List size={14} />
            </button>
            <button
              title="Numbered List (1. )"
              onClick={() => insertFormat("\n1. ", "")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <ListOrdered size={14} />
            </button>

            <div className="h-4 w-px bg-border mx-0.5" />

            <button
              title="Callout / Quote (> )"
              onClick={() => insertFormat("\n> ", "\n")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <Quote size={14} />
            </button>
            <button
              title="Code Block (```)"
              onClick={() => insertFormat("\n```\n", "\n```\n")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <Code size={14} />
            </button>
            <button
              title="Garis Pembatas (---)"
              onClick={() => insertFormat("\n---\n", "")}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground"
            >
              <Minus size={14} />
            </button>
            <button
              title="Sisipkan Gambar (Supabase Upload)"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-1.5 rounded hover:bg-accent hover:text-foreground flex items-center gap-1 text-xs"
            >
              {uploadingImage ? (
                <Loader2 size={14} className="animate-spin text-primary" />
              ) : (
                <ImageIcon size={14} />
              )}
            </button>
          </div>

          {/* Quick Preset Templates (Shown when content is empty or short) */}
          {(!content || content.trim().length === 0) && (
            <div className="border border-dashed border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sparkles size={14} className="text-primary" />
                <span>Pilih Template Cepat atau Mulai Menulis Bebas:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => applyTemplate("marketing")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">📢 Marketing</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Campaign & Growth</div>
                </button>

                <button
                  onClick={() => applyTemplate("devlog")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">🛠️ Dev Log</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Changelog & Sprint</div>
                </button>

                <button
                  onClick={() => applyTemplate("meeting")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">📝 Notulensi</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Meeting & Actions</div>
                </button>

                <button
                  onClick={() => applyTemplate("vision")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">🗺️ Roadmap</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Vision & Goals</div>
                </button>
              </div>
            </div>
          )}

          {/* Main Markdown / Textarea Editor */}
          <div className="min-h-[400px]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Tulis catatan, gunakan markdown (# heading, - [ ] checklist, > quote, dll)..."
              rows={18}
              className="w-full resize-none font-sans text-sm leading-relaxed bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 focus:ring-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
