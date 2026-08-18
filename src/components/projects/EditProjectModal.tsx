'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ImagePlus, Loader2, Trash2 } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  imageUrl?: string | null
  status: string
}

interface Props {
  project: Project
  onClose: () => void
  onUpdated: () => void
}

export default function EditProjectModal({ project, onClose, onUpdated }: Props) {
  const [form, setForm] = useState({
    name: project.name,
    description: project.description || '',
    status: project.status,
    imageUrl: project.imageUrl || '',
  })
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      return setError('File harus berupa gambar')
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const text = await res.text()
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error('Gagal mengunggah gambar: Respon server bukan JSON (terjadi error server)')
      }

      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah gambar')
      }

      setForm((prev) => ({ ...prev, imageUrl: data.url }))
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Nama proyek wajib diisi')
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          status: form.status,
          imageUrl: form.imageUrl || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Gagal memperbarui proyek')
        setLoading(false)
        return
      }

      onUpdated()
    } catch {
      setError('Terjadi kesalahan jaringan')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card text-card-foreground rounded-xl border shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Ubah Proyek</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Proyek *</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Nama proyek"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Deskripsi</label>
            <textarea
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder="Deskripsi proyek..."
              rows={15}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Gambar Proyek (Opsional)</label>
            {form.imageUrl ? (
              <div className="relative mt-2 rounded-lg overflow-hidden border border-border aspect-video group">
                <img
                  src={form.imageUrl}
                  alt="Gambar proyek"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-destructive transition-colors"
                  title="Hapus gambar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                {uploading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <span>Mengunggah gambar...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <ImagePlus size={24} />
                    <span className="text-xs font-medium">Klik untuk memilih gambar proyek</span>
                    <span className="text-[10px] text-muted-foreground/70">PNG, JPG, WEBP hingga 5MB</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="ACTIVE">Aktif (ACTIVE)</option>
              <option value="ON_HOLD">Ditunda (ON_HOLD)</option>
              <option value="COMPLETED">Selesai (COMPLETED)</option>
            </select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Batal
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={loading || uploading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
