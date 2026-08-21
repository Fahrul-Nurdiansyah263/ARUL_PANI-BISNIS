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
  ChevronRight,
  Folder,
  Tag,
  Table as TableIcon,
  Type,
  Eye,
  Edit3,
  Columns,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  Check,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DocPreviewRenderer from "./DocPreviewRenderer";

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

const FONT_SIZES = [
  { label: "Normal (14px)", size: "14px", px: 14 },
  { label: "Sedang (16px)", size: "16px", px: 16 },
  { label: "Besar (18px)", size: "18px", px: 18 },
  { label: "Lebih Besar (22px)", size: "22px", px: 22 },
  { label: "Sangat Besar (26px)", size: "26px", px: 26 },
  { label: "Ukuran Judul (32px)", size: "32px", px: 32 },
  { label: "Hero Banner (40px)", size: "40px", px: 40 },
];

const ZOOM_LEVELS: { id: "sm" | "base" | "lg" | "xl" | "2xl"; label: string; className: string }[] = [
  { id: "sm", label: "Kecil (12px)", className: "text-xs leading-normal" },
  { id: "base", label: "Normal (14px)", className: "text-sm leading-relaxed" },
  { id: "lg", label: "Besar (16px)", className: "text-base leading-relaxed" },
  { id: "xl", label: "Ekstra (18px)", className: "text-lg leading-relaxed" },
  { id: "2xl", label: "Jumbo (20px)", className: "text-xl leading-loose" },
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
| Metrik KPI | Target Q3 | Realisasi | PIC |
| :--- | :--- | :--- | :--- |
| Reach / Impresi | 50.000+ | 62.400 | Marketing Lead |
| Konversi Leads | 15% | 18.2% | Growth Team |
| Biaya per Lead (CPA) | < Rp 25.000 | Rp 21.500 | Ads Specialist |`,
  },
  devlog: {
    title: "Development Log & Changelog",
    content: `## 🛠️ Sprint Log & Perubahan Fitur

### [v1.0.0] - ${new Date().toLocaleDateString("id-ID")}
**Fitur Baru:**
- [x] Setup autentikasi RBAC & Role member
- [x] Integrasi Supabase Storage untuk upload gambar
- [x] Implementasi Workspace Dokumen ala Notion
- [x] Dukungan generator tabel dan auto-numbering list

**Tabel Perubahan Komponen:**
| Komponen | Status | Keterangan |
| :--- | :--- | :--- |
| Auth System | Selesai | Session handling via Next-Auth |
| Workspace Editor | Selesai | Live preview & Smart keyboard |
| Ticket Board | Aktif | Integrasi Kanban drag & drop |`,
  },
  meeting: {
    title: `Notulensi Meeting - ${new Date().toLocaleDateString("id-ID")}`,
    content: `**Peserta:** Seluruh Tim Arul-Pani
**Agenda:** Evaluasi progress mingguan dan pembagian tugas sprint baru.

## 📝 Poin Pembahasan
1. Evaluasi tiket yang masih berstatus REVIEW.
2. Penyesuaian timeline deadline proyek klien.
3. Alur koordinasi materi marketing dan kreatif.

## 📋 Matriks Action Items
| No | PIC | Action Item | Deadline | Status |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Tim Desain | Revisi banner cover klien | Besok | In Progress |
| 2 | Tim Dev | QA test fitur email pengingat | Jumat | Pending |
| 3 | Project Lead | Follow up feedback dari klien | Hari ini | Done |`,
  },
  vision: {
    title: "Vision, Mission & Roadmap",
    content: `> *"Building impactful digital solutions with great craft and strong collaboration."*

## 🌟 Visi Utama
Membangun platform agensi yang efisien, transparan, dan mampu mengelola seluruh siklus proyek dari awal hingga rilis.

## 🗺️ Roadmap Milestone
1. Fase 1: Core Project Management & Task Board
2. Fase 2: Notion-like Workspace & Dokumentasi
3. Fase 3: Integrasi AI Assistant & Otomasi Email
4. Fase 4: Analitik Produktivitas Tim Komprehensif`,
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

  // View Mode: 'edit' | 'split' | 'preview'
  const [viewMode, setViewMode] = useState<"edit" | "split" | "preview">("edit");

  // Editor text zoom level
  const [zoomLevelIndex, setZoomLevelIndex] = useState(1); // default 'base' (14px)

  // Popover menus state
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);

  // Table builder hover grid state (cols x rows)
  const [tableGridHover, setTableGridHover] = useState<{ cols: number; rows: number }>({
    cols: 3,
    rows: 3,
  });
  const [customTableCols, setCustomTableCols] = useState(3);
  const [customTableRows, setCustomTableRows] = useState(3);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const fontSizeMenuRef = useRef<HTMLDivElement>(null);

  // Sync state when doc changes
  useEffect(() => {
    setTitle(doc.title);
    setContent(doc.content || "");
    setCategory(doc.category || "GENERAL");
    setCoverUrl(doc.coverUrl || null);
    setSaveStatus("saved");
    setShowTableMenu(false);
    setShowFontSizeMenu(false);
  }, [doc.id]);

  // Click outside listener for popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tableMenuRef.current &&
        !tableMenuRef.current.contains(e.target as Node)
      ) {
        setShowTableMenu(false);
      }
      if (
        fontSizeMenuRef.current &&
        !fontSizeMenuRef.current.contains(e.target as Node)
      ) {
        setShowFontSizeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Apply Inline Font Size
  const applyFontSize = (size: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selected = currentText.substring(start, end);

    const prefix = `<span style="font-size: ${size}">`;
    const suffix = `</span>`;
    const defaultText = selected || "Teks ukuran " + size;
    const replacement = `${prefix}${defaultText}${suffix}`;

    const nextText =
      currentText.substring(0, start) + replacement + currentText.substring(end);

    setContent(nextText);
    triggerAutosave(title, nextText, category, coverUrl);
    setShowFontSizeMenu(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + defaultText.length
      );
    }, 50);
  };

  // Insert Table Function
  const insertTable = (
    cols: number = 3,
    rows: number = 3,
    customHeaders?: string[],
    customData?: string[][]
  ) => {
    const textarea = textareaRef.current;
    const start = textarea ? textarea.selectionStart : content.length;
    const end = textarea ? textarea.selectionEnd : content.length;
    const currentText = content;

    let tableMd = "\n\n";

    // Header row
    tableMd +=
      "| " +
      Array.from(
        { length: cols },
        (_, c) => customHeaders?.[c] || `Kolom ${c + 1}`
      ).join(" | ") +
      " |\n";

    // Separator row
    tableMd +=
      "| " + Array.from({ length: cols }, () => ":---").join(" | ") + " |\n";

    // Body rows
    for (let r = 0; r < rows; r++) {
      tableMd +=
        "| " +
        Array.from(
          { length: cols },
          (_, c) => customData?.[r]?.[c] || `Data ${r + 1}-${c + 1}`
        ).join(" | ") +
        " |\n";
    }
    tableMd += "\n";

    const nextText =
      currentText.substring(0, start) + tableMd + currentText.substring(end);

    setContent(nextText);
    triggerAutosave(title, nextText, category, coverUrl);
    setShowTableMenu(false);

    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(
          start + tableMd.length,
          start + tableMd.length
        );
      }
    }, 50);
  };

  // Smart List Continuation & Keyboard Handler on Enter / Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Handle Tab and Shift+Tab for Indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;

      if (e.shiftKey) {
        // Shift+Tab: Outdent line
        const lastNewline = currentText.lastIndexOf("\n", start - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const linePrefix = currentText.substring(lineStart, lineStart + 2);

        if (linePrefix === "  ") {
          const nextText =
            currentText.substring(0, lineStart) +
            currentText.substring(lineStart + 2);
          setContent(nextText);
          triggerAutosave(title, nextText, category, coverUrl);
          setTimeout(() => {
            textarea.setSelectionRange(
              Math.max(lineStart, start - 2),
              Math.max(lineStart, end - 2)
            );
          }, 0);
        }
      } else {
        // Tab: Insert 2 spaces
        const nextText =
          currentText.substring(0, start) + "  " + currentText.substring(end);
        setContent(nextText);
        triggerAutosave(title, nextText, category, coverUrl);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
        }, 0);
      }
      return;
    }

    // Handle Enter for Auto-numbering and List Continuation
    if (e.key === "Enter" && !e.shiftKey) {
      const start = textarea.selectionStart;
      const currentText = textarea.value;

      // Extract current line before cursor
      const lastNewlineIndex = currentText.lastIndexOf("\n", start - 1);
      const lineStartIndex =
        lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      const currentLine = currentText.substring(lineStartIndex, start);

      // 1. Check Numbered List: e.g. "1. ", "  2. ", "10. Item"
      const numberedMatch = currentLine.match(/^(\s*)(\d+)\.\s*(.*)$/);
      if (numberedMatch) {
        const indent = numberedMatch[1];
        const num = parseInt(numberedMatch[2], 10);
        const textAfterNumber = numberedMatch[3];

        e.preventDefault();

        // If empty item (e.g. user pressed enter on an empty "2. ")
        if (!textAfterNumber.trim()) {
          // Remove prefix from current line to exit list mode cleanly
          const nextText =
            currentText.substring(0, lineStartIndex) +
            currentText.substring(start);
          setContent(nextText);
          triggerAutosave(title, nextText, category, coverUrl);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        // Increment number to next: e.g. 1. -> 2.
        const nextNumber = num + 1;
        const insertStr = `\n${indent}${nextNumber}. `;
        const nextText =
          currentText.substring(0, start) +
          insertStr +
          currentText.substring(start);

        setContent(nextText);
        triggerAutosave(title, nextText, category, coverUrl);
        setTimeout(() => {
          const newPos = start + insertStr.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      // 2. Check Checklist: e.g. "- [ ] ", "- [x] ", "  - [ ] Tugas"
      const checklistMatch = currentLine.match(/^(\s*)-\s*\[([ xX])\]\s*(.*)$/);
      if (checklistMatch) {
        const indent = checklistMatch[1];
        const textAfterBox = checklistMatch[3];

        e.preventDefault();

        // If empty checklist item
        if (!textAfterBox.trim()) {
          const nextText =
            currentText.substring(0, lineStartIndex) +
            currentText.substring(start);
          setContent(nextText);
          triggerAutosave(title, nextText, category, coverUrl);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        const insertStr = `\n${indent}- [ ] `;
        const nextText =
          currentText.substring(0, start) +
          insertStr +
          currentText.substring(start);

        setContent(nextText);
        triggerAutosave(title, nextText, category, coverUrl);
        setTimeout(() => {
          const newPos = start + insertStr.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      // 3. Check Bullet List: e.g. "- ", "* ", "+ "
      const bulletMatch = currentLine.match(/^(\s*)([-*+])\s*(.*)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1];
        const bulletChar = bulletMatch[2];
        const textAfterBullet = bulletMatch[3];

        e.preventDefault();

        // If empty bullet item
        if (!textAfterBullet.trim()) {
          const nextText =
            currentText.substring(0, lineStartIndex) +
            currentText.substring(start);
          setContent(nextText);
          triggerAutosave(title, nextText, category, coverUrl);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }

        const insertStr = `\n${indent}${bulletChar} `;
        const nextText =
          currentText.substring(0, start) +
          insertStr +
          currentText.substring(start);

        setContent(nextText);
        triggerAutosave(title, nextText, category, coverUrl);
        setTimeout(() => {
          const newPos = start + insertStr.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
        return;
      }

      // 4. Check Blockquote: e.g. "> "
      const quoteMatch = currentLine.match(/^(\s*)>\s*(.*)$/);
      if (quoteMatch) {
        const textAfterQuote = quoteMatch[2];
        if (!textAfterQuote.trim()) {
          e.preventDefault();
          const nextText =
            currentText.substring(0, lineStartIndex) +
            currentText.substring(start);
          setContent(nextText);
          triggerAutosave(title, nextText, category, coverUrl);
          setTimeout(() => {
            textarea.setSelectionRange(lineStartIndex, lineStartIndex);
          }, 0);
          return;
        }
      }
    }
  };

  // Toggle Checklist in Live Preview
  const handleToggleChecklist = (lineIndex: number, checked: boolean) => {
    const lines = content.split("\n");
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex];
      const updatedLine = checked
        ? line.replace(/^(\s*-\s*\[)[ ](\])/, "$1x$2")
        : line.replace(/^(\s*-\s*\[)[xX](\])/, "$1 $2");

      lines[lineIndex] = updatedLine;
      const nextContent = lines.join("\n");
      setContent(nextContent);
      triggerAutosave(title, nextContent, category, coverUrl);
    }
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

    if (
      content &&
      !confirm(
        "Menerapkan template akan mengganti isi dokumen saat ini. Lanjutkan?"
      )
    ) {
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
              <ChevronRight
                size={12}
                className="shrink-0 text-muted-foreground/60"
              />
              <button
                onClick={() => onSelectDoc(doc.parent!.id)}
                className="hover:text-foreground truncate transition-colors"
              >
                {doc.parent.title}
              </button>
            </>
          )}
          <ChevronRight
            size={12}
            className="shrink-0 text-muted-foreground/60"
          />
          <span className="font-semibold text-foreground truncate max-w-[200px]">
            {title || "Tanpa Judul"}
          </span>
        </div>

        {/* Right Actions & Sync Status */}
        <div className="flex items-center gap-2.5 shrink-0">
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
            <div className="max-w-5xl mx-auto px-8 pt-4 pb-0 flex items-center justify-end">
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
        <div className="max-w-5xl mx-auto px-6 sm:px-8 py-6 space-y-5">
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

          {/* Embedded Sub-Pages Section */}
          {doc.children && doc.children.length > 0 && (
            <div className="border border-border/70 rounded-xl p-3.5 bg-card/40 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>
                  Sub-Halaman di dalam dokumen ini ({doc.children.length})
                </span>
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
                    <FileText
                      size={15}
                      className="text-primary shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <span className="text-xs font-medium truncate text-card-foreground flex-1">
                      {child.title || "Tanpa Judul"}
                    </span>
                    <ChevronRight
                      size={12}
                      className="text-muted-foreground/60 group-hover:text-foreground shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comprehensive Rich Formatting Toolbar */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border rounded-xl p-1.5 flex flex-wrap items-center justify-between gap-1 text-muted-foreground shadow-sm">
            {/* Left Tools Group */}
            <div className="flex flex-wrap items-center gap-1">
              {/* Headings */}
              <button
                title="Heading 1 (#)"
                onClick={() => insertFormat("\n# ", "\n")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold transition-colors"
              >
                <Heading1 size={15} />
              </button>
              <button
                title="Heading 2 (##)"
                onClick={() => insertFormat("\n## ", "\n")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold transition-colors"
              >
                <Heading2 size={15} />
              </button>
              <button
                title="Heading 3 (###)"
                onClick={() => insertFormat("\n### ", "\n")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground text-xs font-bold transition-colors"
              >
                <Heading3 size={15} />
              </button>

              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Font Size Dropdown Popover */}
              <div className="relative" ref={fontSizeMenuRef}>
                <button
                  type="button"
                  title="Ukuran Huruf Teks (Font Size)"
                  onClick={() => {
                    setShowFontSizeMenu(!showFontSizeMenu);
                    setShowTableMenu(false);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    showFontSizeMenu
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Type size={14} />
                  <span className="text-[11px] hidden sm:inline">Ukuran Huruf</span>
                  <ChevronDown size={11} />
                </button>

                {showFontSizeMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-56 rounded-xl border bg-popover text-popover-foreground shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b mb-1">
                      Pilih Ukuran Font Teks
                    </div>
                    {FONT_SIZES.map((f) => (
                      <button
                        key={f.size}
                        onClick={() => applyFontSize(f.size)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-accent hover:text-accent-foreground flex items-center justify-between group transition-colors"
                      >
                        <span style={{ fontSize: `${Math.min(f.px, 20)}px` }} className="font-medium truncate">
                          {f.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-mono">
                          {f.size}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Bold & Italic */}
              <button
                title="Tebal (**teks**)"
                onClick={() => insertFormat("**", "**")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <Bold size={14} />
              </button>
              <button
                title="Miring (*teks*)"
                onClick={() => insertFormat("*", "*")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <Italic size={14} />
              </button>

              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Lists & Checklists */}
              <button
                title="To-do Checklist (- [ ]) (Enter untuk buat baru)"
                onClick={() => insertFormat("\n- [ ] ", "")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <CheckSquare size={14} />
              </button>
              <button
                title="Bullet List (- )"
                onClick={() => insertFormat("\n- ", "")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <List size={14} />
              </button>
              <button
                title="Numbered List (1. ) (Enter otomatis nomor berikutnya!)"
                onClick={() => insertFormat("\n1. ", "")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <ListOrdered size={14} />
              </button>

              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Interactive Table Generator Popover */}
              <div className="relative" ref={tableMenuRef}>
                <button
                  type="button"
                  title="Buat Tabel Markdown"
                  onClick={() => {
                    setShowTableMenu(!showTableMenu);
                    setShowFontSizeMenu(false);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                    showTableMenu
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-foreground"
                  )}
                >
                  <TableIcon size={14} />
                  <span className="text-[11px]">Tabel</span>
                  <ChevronDown size={11} />
                </button>

                {showTableMenu && (
                  <div className="absolute top-full left-0 mt-1.5 w-72 rounded-xl border bg-popover text-popover-foreground shadow-2xl p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between pb-2 border-b mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                        <LayoutGrid size={13} className="text-primary" />
                        <span>Sisipkan Tabel</span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
                        {tableGridHover.cols} × {tableGridHover.rows}
                      </span>
                    </div>

                    {/* Interactive 6x6 Grid Matrix */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-muted-foreground">Pilih Baris & Kolom (Hover & Klik):</div>
                      <div
                        className="grid grid-cols-6 gap-1 p-2 rounded-lg bg-muted/40 border border-border/80 w-fit mx-auto cursor-pointer"
                        onMouseLeave={() => setTableGridHover({ cols: 3, rows: 3 })}
                      >
                        {Array.from({ length: 6 }).map((_, r) =>
                          Array.from({ length: 6 }).map((_, c) => {
                            const isHighlighted =
                              c < tableGridHover.cols && r < tableGridHover.rows;
                            return (
                              <div
                                key={`${r}-${c}`}
                                onMouseEnter={() =>
                                  setTableGridHover({ cols: c + 1, rows: r + 1 })
                                }
                                onClick={() =>
                                  insertTable(c + 1, r + 1)
                                }
                                className={cn(
                                  "w-5 h-5 rounded-xs transition-all border",
                                  isHighlighted
                                    ? "bg-primary border-primary scale-105"
                                    : "bg-background border-border/70 hover:border-primary/50"
                                )}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Custom Input Rows/Cols */}
                    <div className="mt-3 pt-2.5 border-t space-y-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Ukuran Kustom:
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-[11px] text-muted-foreground">Kol:</span>
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={customTableCols}
                            onChange={(e) => setCustomTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-accent/50 border rounded px-1.5 py-1 text-xs text-center text-foreground font-mono focus:outline-none"
                          />
                        </div>
                        <div className="flex items-center gap-1 flex-1">
                          <span className="text-[11px] text-muted-foreground">Bar:</span>
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={customTableRows}
                            onChange={(e) => setCustomTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-accent/50 border rounded px-1.5 py-1 text-xs text-center text-foreground font-mono focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => insertTable(customTableCols, customTableRows)}
                          className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                        >
                          Sisipkan
                        </button>
                      </div>
                    </div>

                    {/* Table Presets */}
                    <div className="mt-2.5 pt-2 border-t space-y-1">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Template Tabel Siap Pakai:
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          insertTable(
                            3,
                            3,
                            ["Fitur", "Paket Starter", "Paket Enterprise"],
                            [
                              ["Unlimited Workspace", "Ya", "Ya"],
                              ["Kapasitas Upload", "100 MB", "10 GB"],
                              ["Priority Support", "Email", "24/7 Dedicated"],
                            ]
                          )
                        }
                        className="w-full text-left px-2 py-1 rounded hover:bg-accent text-[11px] text-card-foreground flex items-center justify-between"
                      >
                        <span>⚖️ Perbandingan Fitur</span>
                        <span className="text-[10px] text-muted-foreground">3×3</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          insertTable(
                            5,
                            3,
                            ["No", "PIC", "Tugas & Fitur", "Deadline", "Status"],
                            [
                              ["1", "Dev Team", "Integrasi Supabase", "2026-08-25", "In Progress"],
                              ["2", "Design Lead", "Revisi Mockup UI", "2026-08-26", "Pending"],
                              ["3", "Marketing", "Draft Press Release", "2026-08-28", "To-Do"],
                            ]
                          )
                        }
                        className="w-full text-left px-2 py-1 rounded hover:bg-accent text-[11px] text-card-foreground flex items-center justify-between"
                      >
                        <span>🎯 Matriks Tugas / KPI</span>
                        <span className="text-[10px] text-muted-foreground">5×3</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-border mx-0.5" />

              {/* Quote, Code, Divider, Image */}
              <button
                title="Callout / Quote (> )"
                onClick={() => insertFormat("\n> ", "\n")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <Quote size={14} />
              </button>
              <button
                title="Code Block (```)"
                onClick={() => insertFormat("\n```\n", "\n```\n")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <Code size={14} />
              </button>
              <button
                title="Garis Pembatas (---)"
                onClick={() => insertFormat("\n---\n", "")}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground transition-colors"
              >
                <Minus size={14} />
              </button>
              <button
                title="Sisipkan Gambar (Supabase Upload)"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadingImage}
                className="p-1.5 rounded hover:bg-accent hover:text-foreground flex items-center gap-1 text-xs transition-colors"
              >
                {uploadingImage ? (
                  <Loader2 size={14} className="animate-spin text-primary" />
                ) : (
                  <ImageIcon size={14} />
                )}
              </button>
            </div>

            {/* Right Tools Group: Text Zoom & Mode Switcher */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Text Zoom Controls */}
              <div className="flex items-center bg-muted/60 border rounded-lg p-0.5">
                <button
                  type="button"
                  title="Perkecil Ukuran Teks Editor"
                  disabled={zoomLevelIndex === 0}
                  onClick={() => setZoomLevelIndex((prev) => Math.max(0, prev - 1))}
                  className="p-1 rounded hover:bg-background disabled:opacity-30 text-xs transition-colors"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-semibold px-1 text-muted-foreground min-w-[28px] text-center">
                  {ZOOM_LEVELS[zoomLevelIndex].label.split(" ")[0]}
                </span>
                <button
                  type="button"
                  title="Perbesar Ukuran Teks Editor"
                  disabled={zoomLevelIndex === ZOOM_LEVELS.length - 1}
                  onClick={() =>
                    setZoomLevelIndex((prev) =>
                      Math.min(ZOOM_LEVELS.length - 1, prev + 1)
                    )
                  }
                  className="p-1 rounded hover:bg-background disabled:opacity-30 text-xs transition-colors"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              {/* View Mode Switcher: Edit / Split / Preview */}
              <div className="flex items-center bg-muted/60 border rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("edit")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all",
                    viewMode === "edit"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Mode Edit Dokumen"
                >
                  <Edit3 size={12} />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("split")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all",
                    viewMode === "split"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Mode Split (Editor & Preview)"
                >
                  <Columns size={12} />
                  <span className="hidden sm:inline">Split</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all",
                    viewMode === "preview"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Mode Live Preview"
                >
                  <Eye size={12} />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              </div>
            </div>
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
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Campaign & Growth
                  </div>
                </button>

                <button
                  onClick={() => applyTemplate("devlog")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">🛠️ Dev Log</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Changelog & Sprint
                  </div>
                </button>

                <button
                  onClick={() => applyTemplate("meeting")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">📝 Notulensi</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Meeting & Actions
                  </div>
                </button>

                <button
                  onClick={() => applyTemplate("vision")}
                  className="p-2.5 text-left rounded-lg border border-border/70 bg-card hover:bg-accent text-xs transition-colors"
                >
                  <div className="font-semibold text-foreground">🗺️ Roadmap</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Vision & Goals
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Main Editor / Preview Layout */}
          <div className="min-h-[450px]">
            {/* 1. Edit Mode */}
            {viewMode === "edit" && (
              <div className="w-full">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Tulis catatan, tekan Enter untuk melanjutkan nomor otomatis (1. -> 2.), gunakan toolbar untuk tabel atau perbesar huruf..."
                  rows={20}
                  className={cn(
                    "w-full resize-none font-sans bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 focus:ring-0",
                    ZOOM_LEVELS[zoomLevelIndex].className
                  )}
                />
              </div>
            )}

            {/* 2. Split Mode (Editor on Left, Live Preview on Right) */}
            {viewMode === "split" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-2xl p-4 bg-card/40">
                <div className="flex flex-col border-r pr-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Edit3 size={11} /> Markdown Editor
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Tulis catatan di sini..."
                    rows={20}
                    className={cn(
                      "w-full flex-1 resize-none font-mono bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/40 focus:ring-0",
                      ZOOM_LEVELS[zoomLevelIndex].className
                    )}
                  />
                </div>

                <div className="flex flex-col overflow-y-auto max-h-[600px] pl-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Eye size={11} /> Live Preview
                  </div>
                  <div className="flex-1 bg-background/60 rounded-xl p-4 border border-border/70 overflow-y-auto">
                    <DocPreviewRenderer
                      content={content}
                      onToggleChecklist={handleToggleChecklist}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Preview Mode */}
            {viewMode === "preview" && (
              <div className="border rounded-2xl p-6 sm:p-8 bg-card/60 shadow-xs">
                <DocPreviewRenderer
                  content={content}
                  onToggleChecklist={handleToggleChecklist}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
