'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Users, Search, Shield, Mail, Briefcase, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserItem {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'MEMBER'
  position: string | null
  avatarUrl: string | null
  isActive: boolean
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const isOwner = session?.user?.role === 'OWNER'

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users?limit=100')
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Gagal memuat daftar anggota tim')
      }
      const json = await res.json()
      setUsers(Array.isArray(json) ? json : json.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOwner) {
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [isOwner])

  if (!isOwner && session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border border-amber-500/20 bg-amber-500/10 rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center mb-3">
          <Shield size={24} />
        </div>
        <h2 className="text-lg font-bold text-foreground">Akses Terbatas</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Halaman ini khusus untuk **OWNER** agensi. Kontak administrator jika Anda memerlukan akses pengolahan anggota tim.
        </p>
      </div>
    )
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.position && u.position.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anggota Tim</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Daftar seluruh tim dan staf Sejiwa Agency
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari anggota tim..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted-foreground text-sm">Memuat data anggota tim...</p>
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/10 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium mb-2">Error: {error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-background border hover:bg-accent transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Users size={32} className="text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">
            {search ? 'Tidak ada anggota tim yang cocok dengan pencarian.' : 'Belum ada anggota tim terdaftar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="border bg-card hover:bg-accent/20 rounded-2xl p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base shrink-0">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.name[0]?.toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base leading-snug truncate text-card-foreground">
                        {user.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <Mail size={12} className="shrink-0" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0',
                      user.role === 'OWNER'
                        ? 'bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400'
                        : 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400'
                    )}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Briefcase size={13} className="shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{user.position || 'Anggota Tim'}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 font-medium">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <XCircle size={12} />
                        Nonaktif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
