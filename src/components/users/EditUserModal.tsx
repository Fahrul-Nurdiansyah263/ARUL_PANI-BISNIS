"use client";

import { useState, useEffect } from "react";
import { X, User, Mail, Lock, Briefcase, Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
  position: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

interface EditUserModalProps {
  user: UserItem;
  currentUserId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditUserModal({
  user,
  currentUserId,
  onClose,
  onUpdated,
}: EditUserModalProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [position, setPosition] = useState(user.position || "");
  const [role, setRole] = useState<"MEMBER" | "OWNER">(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isSelf = user.id === currentUserId;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Nama dan Email wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        position: position.trim() || null,
        role,
        isActive,
      };

      if (newPassword.trim().length > 0) {
        if (newPassword.trim().length < 6) {
          throw new Error("Password baru minimal 6 karakter");
        }
        payload.password = newPassword.trim();
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal memperbarui anggota tim");
      }

      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-card border text-card-foreground rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Edit Anggota Tim</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Perbarui profil, jabatan, dan hak akses anggota
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <User size={13} className="text-muted-foreground" />
              Nama Lengkap <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail size={13} className="text-muted-foreground" />
              Alamat Email <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Briefcase size={13} className="text-muted-foreground" />
                Jabatan / Posisi
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Shield size={13} className="text-muted-foreground" />
                Peran (Role)
              </label>
              <select
                value={role}
                disabled={isSelf}
                onChange={(e) => setRole(e.target.value as "MEMBER" | "OWNER")}
                className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground font-medium disabled:opacity-60"
              >
                <option value="MEMBER">MEMBER (Staf / Tim)</option>
                <option value="OWNER">OWNER (Direktur / Admin)</option>
              </select>
            </div>
          </div>

          {/* Status Keaktifan */}
          <div className="p-3.5 rounded-xl border bg-accent/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-foreground">Status Akun</div>
              <div className="text-[11px] text-muted-foreground">
                {isActive
                  ? "Akun aktif dan dapat masuk ke platform"
                  : "Akun dinonaktifkan dan tidak dapat masuk"}
              </div>
            </div>

            <button
              type="button"
              disabled={isSelf}
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-destructive/10 text-destructive border border-destructive/20"
              } ${isSelf ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{isActive ? "Aktif" : "Nonaktif"}</span>
            </button>
          </div>

          {/* Reset Password Optional */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock size={13} className="text-muted-foreground" />
              Reset Password Baru (Opsional)
            </label>
            <input
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
