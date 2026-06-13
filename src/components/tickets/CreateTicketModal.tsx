'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { hasPermission } from '@/lib/permissions'

interface Division {
  id: string
  name: string
}

interface User {
  id: string
  name: string
  role: string
}

interface Props {
  companyId: string
  divisionId: string | null
  role: string
  onClose: () => void
  onCreated: () => void
}

export default function CreateTicketModal({
  companyId,
  divisionId,
  role,
  onClose,
  onCreated,
}: Props) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    assigneeId: '',
    selectedDivisionId: divisionId || '',
  })
  const [divisions, setDivisions] = useState<Division[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canViewAllDivisions = hasPermission(role, 'canViewAllDivisions')

  // Load divisi kalau SUPER_ADMIN
  useEffect(() => {
    if (canViewAllDivisions) {
      fetch('/api/divisions')
        .then((r) => {
          if (!r.ok) throw new Error('Gagal memuat divisi')
          return r.json()
        })
        .then((json) => setDivisions(Array.isArray(json) ? json : json.data ?? []))
        .catch((err) => setError(err.message))
    }
  }, [canViewAllDivisions])

  // Load users berdasarkan divisi yang dipilih
  useEffect(() => {
    if (!form.selectedDivisionId) return
    fetch(`/api/users?divisionId=${form.selectedDivisionId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Gagal memuat user')
        return r.json()
      })
      .then((json) => setUsers(Array.isArray(json) ? json : json.data ?? []))
      .catch((err) => setError(err.message))
  }, [form.selectedDivisionId])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleSubmit = async () => {
    if (!form.title) return setError('Title wajib diisi')
    if (!form.selectedDivisionId) return setError('Pilih divisi dulu')
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          deadline: form.deadline || null,
          assigneeId: form.assigneeId || null,
          divisionId: form.selectedDivisionId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal membuat ticket')
        setLoading(false)
        return
      }

      onCreated()
    } catch {
      setError('Terjadi kesalahan jaringan')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card rounded-xl border shadow-xl w-full max-w-md p-6 mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Buat Ticket Baru</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Pilih Divisi — hanya yang bisa lihat semua divisi */}
          {canViewAllDivisions && (
            <div>
              <label className="text-sm font-medium">Divisi *</label>
              <select
                className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.selectedDivisionId}
                onChange={(e) =>
                  setForm({ ...form, selectedDivisionId: e.target.value, assigneeId: '' })
                }
              >
                <option value="">Pilih divisi...</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Judul *</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Judul ticket"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Deskripsi ticket..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="text-sm font-medium">Assign ke</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.assigneeId}
              onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}
              disabled={!form.selectedDivisionId}
            >
              <option value="">Pilih assignee...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Deadline</label>
            <input
              type="date"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Buat Ticket'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}