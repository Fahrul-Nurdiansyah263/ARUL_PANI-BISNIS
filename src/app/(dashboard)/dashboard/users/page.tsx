"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Search,
  Shield,
  Mail,
  Briefcase,
  CheckCircle2,
  XCircle,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import DeleteUserModal from "@/components/users/DeleteUserModal";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MEMBER";
  position: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    assignedTickets: number;
  };
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const isOwner = session?.user?.role === "OWNER";
  const currentUserId = session?.user?.id;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users?limit=100");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal memuat daftar anggota tim");
      }
      const json = await res.json();
      setUsers(Array.isArray(json) ? json : json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOwner) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [isOwner, fetchUsers]);

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal menghapus anggota tim");
      }

      setDeletingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Quick Toggle Active Status
  const handleToggleStatus = async (user: UserItem) => {
    if (user.id === currentUserId) {
      alert("Anda tidak dapat menonaktifkan akun Anda sendiri saat sedang login.");
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Gagal mengubah status akun");
      }

      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!isOwner && session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-amber-500/20 bg-amber-500/10 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
          <Shield size={24} />
        </div>
        <h2 className="text-lg font-bold text-foreground">Akses Terbatas</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Halaman ini khusus untuk <strong>OWNER</strong> agensi. Kontak administrator jika Anda memerlukan akses pengolahan anggota tim.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats calculation
  const totalUsers = users.length;
  const totalOwners = users.filter((u) => u.role === "OWNER").length;
  const totalMembers = users.filter((u) => u.role === "MEMBER").length;
  const totalActive = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anggota Tim</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola staf, hak akses, dan akun tim Arul-Pani Agency
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah Anggota</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-card/60 shadow-2xs space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Users size={14} className="text-primary" />
            <span>Total Anggota</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{totalUsers}</div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-2xs space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Crown size={14} className="text-purple-500" />
            <span>Owner / Admin</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{totalOwners}</div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-2xs space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Briefcase size={14} className="text-blue-500" />
            <span>Member / Tim</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{totalMembers}</div>
        </div>

        <div className="p-4 rounded-xl border bg-card/60 shadow-2xs space-y-1">
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <UserCheck size={14} className="text-emerald-500" />
            <span>Akun Aktif</span>
          </div>
          <div className="text-2xl font-extrabold tracking-tight">{totalActive}</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, email, atau jabatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border/80 bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted-foreground text-sm">Memuat data anggota tim...</p>
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/10 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium mb-2">Error: {error}</p>
          <Button variant="outline" onClick={fetchUsers}>
            Coba Lagi
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Users size={32} className="text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            {search
              ? "Tidak ada anggota tim yang cocok dengan pencarian."
              : "Belum ada anggota tim terdaftar."}
          </p>
          {!search && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              variant="outline"
              size="sm"
            >
              Tambah Anggota Pertama
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className={cn(
                  "border bg-card hover:bg-accent/20 rounded-2xl p-5 shadow-2xs transition-all duration-200 flex flex-col justify-between group",
                  !user.isActive && "opacity-60 border-dashed"
                )}
              >
                <div className="space-y-4">
                  {/* Top Avatar & Role */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          user.name[0]?.toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm leading-snug truncate text-card-foreground">
                            {user.name}
                          </h3>
                          {isSelf && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-semibold">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <Mail size={12} className="shrink-0" />
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                        user.role === "OWNER"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400"
                          : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400"
                      )}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Position & Status */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                      <Briefcase
                        size={13}
                        className="shrink-0 text-muted-foreground/70"
                      />
                      <span className="truncate">
                        {user.position || "Anggota Tim"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "Tidak dapat menonaktifkan akun sendiri"
                          : `Klik untuk ${user.isActive ? "Nonaktifkan" : "Aktifkan"}`
                      }
                      className={cn(
                        "flex items-center gap-1 shrink-0 font-medium px-2 py-0.5 rounded-md text-[11px] transition-colors",
                        user.isActive
                          ? "text-emerald-600 hover:bg-emerald-500/10"
                          : "text-muted-foreground hover:bg-muted",
                        isSelf && "cursor-default"
                      )}
                    >
                      {user.isActive ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Action Buttons (OWNER Only) */}
                <div className="pt-3.5 mt-3.5 border-t border-border/60 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {user._count?.assignedTickets || 0} Tiket Ditugaskan
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Edit Anggota"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit2 size={14} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSelf}
                      title={
                        isSelf
                          ? "Tidak dapat menghapus akun sendiri"
                          : "Hapus Anggota"
                      }
                      className="h-8 w-8 text-muted-foreground hover:text-destructive disabled:opacity-40"
                      onClick={() => setDeletingUser(user)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {isCreateOpen && (
        <CreateUserModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false);
            fetchUsers();
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          currentUserId={currentUserId || ""}
          onClose={() => setEditingUser(null)}
          onUpdated={() => {
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          userName={deletingUser.name}
          loading={deleting}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
