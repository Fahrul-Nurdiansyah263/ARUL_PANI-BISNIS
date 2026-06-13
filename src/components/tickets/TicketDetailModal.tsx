'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageSquare, Send, Calendar, User, Tag, Clock } from 'lucide-react'
import { hasPermission } from '@/lib/permissions'
import { Ticket } from './TicketBoard'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  content: string
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
  PRIORITY: 'bg-purple-100 text-purple-800 border-purple-300',
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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Menentukan apakah user saat ini punya izin untuk berkomentar
  const canComment =
    hasPermission(currentUser.role, 'canCommentOnAnyTicket') ||
    (hasPermission(currentUser.role, 'canCommentOnAssignedOnly') &&
      ticket.assignee?.id === currentUser.id)

  // Fetch comments
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
  }, [ticket.id])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirim komentar')
      }

      setComments((prev) => [...prev, data])
      setNewComment('')
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
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-border/40 text-sm">
            <div className="space-y-3.5">
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <User size={16} className="text-muted-foreground/70 mt-0.5" />
                <div className="flex flex-col">
                  <span>Pembuat: <strong className="text-foreground font-semibold">{ticket.createdBy.name}</strong></span>
                  {ticket.createdBy.position && (
                    <span className="text-xs text-foreground/80 font-medium mt-0.5">
                      {ticket.createdBy.position}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground/85 font-semibold mt-0.5 tracking-wide uppercase">
                    {ticket.createdBy.role} • {ticket.createdBy.division?.name || 'Semua Divisi'}
                  </span>
                  {ticket.createdBy.division?.description && (
                    <span className="text-[11px] text-muted-foreground/75 italic mt-0.5">
                      {ticket.createdBy.division.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-muted-foreground">
                <Tag size={16} className="text-muted-foreground/70 mt-0.5" />
                <div className="flex flex-col">
                  <span>Penerima Tugas: <strong className="text-foreground font-semibold">{ticket.assignee?.name || 'Belum ditugaskan'}</strong></span>
                  {ticket.assignee && (
                    <>
                      {ticket.assignee.position && (
                        <span className="text-xs text-foreground/80 font-medium mt-0.5">
                          {ticket.assignee.position}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground/85 font-semibold mt-0.5 tracking-wide uppercase">
                        {ticket.assignee.role} • {ticket.assignee.division?.name || 'Semua Divisi'}
                      </span>
                      {ticket.assignee.division?.description && (
                        <span className="text-[11px] text-muted-foreground/75 italic mt-0.5">
                          {ticket.assignee.division.description}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar size={16} className="text-muted-foreground/70" />
                <span>
                  Deadline:{' '}
                  <strong className="text-foreground font-semibold">
                    {ticket.deadline
                      ? new Date(ticket.deadline).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Tidak ada'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Clock size={16} className="text-muted-foreground/70" />
                <span>
                  Divisi:{' '}
                  <strong className="text-foreground font-semibold">
                    {ticket.division?.name || ticket.divisionId}
                  </strong>
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
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{comment.user.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString('id-ID', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-foreground/95 leading-relaxed break-words">
                        {comment.content}
                      </p>
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
              <form onSubmit={handlePostComment} className="flex gap-2 items-end pt-2">
                <div className="flex-1">
                  <textarea
                    rows={2}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-background placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none leading-relaxed"
                    placeholder="Tulis komentar Anda..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                  />
                </div>
                <Button
                  type="submit"
                  className="rounded-xl h-[48px] px-4 font-semibold shrink-0 gap-1.5"
                  disabled={submitting || !newComment.trim()}
                >
                  <Send size={14} />
                  {submitting ? 'Mengirim...' : 'Kirim'}
                </Button>
              </form>
            ) : (
              <div className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-500 px-4 py-3 rounded-xl border border-amber-500/20 text-center font-medium">
                {hasPermission(currentUser.role, 'canCommentOnAssignedOnly')
                  ? 'Hanya penerima tugas (assignee) yang dapat mengomentari tiket ini.'
                  : 'Anda tidak memiliki izin untuk mengomentari tiket di divisi/proyek ini.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
