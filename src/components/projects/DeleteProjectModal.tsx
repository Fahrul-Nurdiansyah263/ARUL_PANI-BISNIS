'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface Props {
  projectName: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function DeleteProjectModal({
  projectName,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-md p-6 mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground">Hapus Proyek</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Apakah Anda yakin ingin menghapus proyek <span className="font-semibold text-foreground">"{projectName}"</span>?
            </p>
            <p className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded border">
              * Semua tiket/tugas yang terhubung dengan proyek ini akan dilepas (status proyek tiket menjadi kosong) tetapi tidak akan terhapus.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground shrink-0"
            disabled={loading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2 pt-6 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </Button>
        </div>
      </div>
    </div>
  )
}
