'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X, Calendar, Ticket, Edit2, Trash2, ArrowRight, FolderKanban } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  imageUrl?: string | null
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED'
  createdAt: string
  _count: {
    tickets: number
  }
}

interface Props {
  project: Project
  isOwner: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectDetailModal({
  project,
  isOwner,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            ● Aktif
          </span>
        )
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            ● Ditunda
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            ● Selesai
          </span>
        )
    }
  }

  const formattedDate = new Date(project.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card border text-card-foreground rounded-2xl lg:w-3xl md:w-xl w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Cover Image Header */}
        <div className="relative w-full h-48 bg-muted overflow-hidden flex items-center justify-center">
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <FolderKanban size={40} className="opacity-50" />
              <span className="text-xs font-medium">Tidak Ada Sampul Proyek</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {project.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                <Calendar size={13} />
                Dibuat pada {formattedDate}
              </p>
            </div>
            {getStatusBadge(project.status)}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Deskripsi Proyek
            </h4>
            <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-accent/40 rounded-xl p-3.5 border border-accent/60">
              {project.description || 'Belum ada deskripsi untuk proyek ini.'}
            </p>
          </div>

          {/* Stats Info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-accent/30 border rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Ticket size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Tiket</p>
                <p className="text-lg font-bold">{project._count.tickets} Tugas</p>
              </div>
            </div>

            <div className="bg-accent/30 border rounded-xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FolderKanban size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Status</p>
                <p className="text-sm font-bold capitalize">
                  {project.status === 'ACTIVE'
                    ? 'Aktif'
                    : project.status === 'ON_HOLD'
                    ? 'Ditunda'
                    : 'Selesai'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose()
                onEdit()
              }}
              className="flex items-center gap-1.5"
            >
              <Edit2 size={14} />
              Edit
            </Button>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose()
                  onDelete()
                }}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                Hapus
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                onClose()
                router.push(`/dashboard/projects/${project.id}`)
              }}
              className="flex items-center gap-1.5"
            >
              Buka Workspace
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
