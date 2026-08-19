"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteUserModalProps {
  userName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  userName,
  loading,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border text-card-foreground rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <AlertTriangle size={22} />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Hapus Anggota Tim?
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun{" "}
              <strong className="text-foreground">"{userName}"</strong>? Tindakan
              ini akan menghapus akses pengguna dari platform.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Ya, Hapus Anggota
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
