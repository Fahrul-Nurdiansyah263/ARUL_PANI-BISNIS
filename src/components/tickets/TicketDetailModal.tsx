'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageSquare, Send, Calendar, FolderKanban, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { hasPermission } from '@/lib/permissions'
import { Ticket } from './TicketBoard'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

interface Props {
  ticket: Ticket
  currentUser: {
    id: string
    role: string
  }
  onClose: () => void
  onCommentAdded: (ticketId: string) => void
}

const statusMap = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-300',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-300',
  REVIEW: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  PRIORITY: 'bg-red-100 text-red-700 border-red-300',
  DONE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
}

export default function TicketDetailModal({
  ticket,
  currentUser,
  onClose,
  onCommentAdded,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentImage, setCommentImage] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [currentProjectId, setCurrentProjectId] = useState<string>(ticket.project?.id || '')

  // Semua anggota Arul-Pani Agency bisa berkomentar di tiket manapun
  const canComment = hasPermission(currentUser.role, 'canCommentOnAnyTicket')

  // Fetch comments & projects
  useEffect(() => {
    setLoadingComments(true)
    setError('')
    fetch(`/api/tickets/${ticket.id}/comments`)
      .then((r) => {
        if (!r.ok) throw new Error('Gagal mengambil komentar')
        return r.json()
      })
      .then((data) => setComments(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingComments(false))

    fetch('/api/projects?limit=100')
      .then((r) => r.json())
      .then((json) => {
        setProjects(Array.isArray(json) ? json : json.data ?? [])
      })
      .catch((err) => console.error('Gagal memuat projects', err))
  }, [ticket.id])

  const handleProjectChange = async (projectId: string) => {
    setCurrentProjectId(projectId)
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId || null }),
      })
      if (!res.ok) {
        throw new Error('Gagal memperbarui proyek tiket')
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  // Close on Escape key
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

    setUploadingImage(true)
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

      setCommentImage(data.url)
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar komentar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment.trim(),
          imageUrl: commentImage || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim komentar')
      }

      setComments((prev) => [...prev, data])
      setNewComment('')
      setCommentImage('')
      onCommentAdded(ticket.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border/80">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-semibold border uppercase tracking-wider', statusMap[ticket.status])}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground mt-2 leading-tight">
              {ticket.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Metadata */}
          <div className="flex flex-col sm:flex-row gap-3 bg-muted/40 p-4 rounded-xl border border-border/40 text-sm">
            {/* Pembuat */}
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shrink-0">
                {ticket.createdBy.name[0]}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Pembuat</span>
                <span className="font-semibold text-foreground truncate">{ticket.createdBy.name}</span>
                <span className="text-xs text-muted-foreground">
                  {ticket.createdBy.position}
                </span>
              </div>
            </div>

            <div className="w-px bg-border/60 hidden sm:block" />

            {/* Ditugaskan ke */}
            <div className="flex items-center gap-2.5 flex-1">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground border border-border shrink-0">
                {ticket.assignee ? ticket.assignee.name[0] : '?'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Ditugaskan ke</span>
                <span className="font-semibold text-foreground truncate">
                  {ticket.assignee?.name || 'Belum ditugaskan'}
                </span>
                {ticket.assignee && (
                  <span className="text-xs text-muted-foreground">
                    {ticket.assignee.position}
                  </span>
                )}
              </div>
            </div>

            <div className="w-px bg-border/60 hidden sm:block" />

            {/* Proyek */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <FolderKanban size={16} className="text-muted-foreground/70 shrink-0" />
              <div className="flex flex-col min-w-0 w-full">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Proyek</span>
                <select
                  className="bg-transparent border-0 font-semibold text-foreground p-0 focus:ring-0 focus:outline-none text-sm w-full truncate cursor-pointer hover:underline"
                  value={currentProjectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                >
                  <option value="">Tanpa Proyek</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-px bg-border/60 hidden sm:block" />

            {/* Deadline */}
            <div className="flex items-center gap-2.5">
              <Calendar size={16} className="text-muted-foreground/70 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Deadline</span>
                <span className="font-semibold text-foreground" suppressHydrationWarning>
                  {ticket.deadline
                    ? new Date(ticket.deadline).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Tidak ada'}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground/80">Deskripsi</h3>
              <div className="text-sm text-foreground/90 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/30 whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-4 border-t border-border/80 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" />
              <h3 className="text-base font-bold text-foreground">
                Komentar ({comments.length})
              </h3>
            </div>

            {/* Comments List */}
            {loadingComments ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground text-sm gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span>Memuat komentar...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Belum ada komentar. Jadilah yang pertama memberikan masukan!
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-3 text-sm bg-muted/10 p-3 rounded-lg border border-border/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shrink-0 mt-0.5">
                      {comment.user.name[0].toUpperCase()}
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{comment.user.name}</span>
                        <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                          {new Date(comment.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-foreground/95 leading-relaxed break-words">
                        {comment.content}
                      </p>

                      {/* Comment Image Attachment */}
                      {comment.imageUrl && (
                        <div className="mt-2 max-w-sm rounded-lg overflow-hidden border border-border">
                          <a href={comment.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={comment.imageUrl}
                              alt="Gambar Lampiran Komentar"
                              className="w-full max-h-60 object-cover hover:opacity-90 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-xs border border-destructive/20">
                {error}
              </div>
            )}

            {/* Comment Form */}
            {canComment ? (
              <form onSubmit={handlePostComment} className="flex flex-col gap-2.5 pt-2">
                {commentImage && (
                  <div className="relative w-32 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={commentImage} alt="Lampiran komentar" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCommentImage('')}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-destructive transition-colors"
                      title="Hapus gambar"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <textarea
                      rows={2}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none leading-relaxed"
                      placeholder="Tulis komentar Anda..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <label className="p-3 rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted transition-colors flex items-center justify-center shrink-0 h-[48px] w-[48px]">
                    {uploadingImage ? (
                      <Loader2 size={18} className="animate-spin text-primary" />
                    ) : (
                      <ImagePlus size={18} />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || submitting}
                      className="hidden"
                    />
                  </label>

                  <Button
                    type="submit"
                    className="rounded-xl h-[48px] px-4 font-semibold shrink-0 gap-1.5"
                    disabled={submitting || uploadingImage || !newComment.trim()}
                  >
                    <Send size={14} />
                    {submitting ? 'Mengirim...' : 'Kirim'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-500 px-4 py-3 rounded-xl border border-amber-500/20 text-center font-medium">
                Anda tidak memiliki izin untuk mengomentari tiket ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
