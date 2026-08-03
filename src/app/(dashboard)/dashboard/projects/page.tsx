'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { FolderKanban, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import CreateProjectModal from '@/components/projects/CreateProjectModal'
import EditProjectModal from '@/components/projects/EditProjectModal'
import DeleteProjectModal from '@/components/projects/DeleteProjectModal'
import ProjectDetailModal from '@/components/projects/ProjectDetailModal'

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

export default function ProjectsPage() {
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects?limit=100')
      if (!res.ok) throw new Error('Gagal memuat daftar proyek')
      const json = await res.json()
      setProjects(Array.isArray(json) ? json : json.data ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${deletingProject.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Gagal menghapus proyek')
      }
      setDeletingProject(null)
      fetchProjects()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const isOwner = session?.user?.role === 'OWNER'

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Aktif
          </span>
        )
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Ditunda
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Selesai
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Proyek</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola proyek klien dan bagikan tiket tugas tim kamu
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Proyek Baru
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-muted-foreground text-sm">Memuat data proyek...</p>
        </div>
      ) : error ? (
        <div className="border border-destructive/20 bg-destructive/10 rounded-xl p-6 text-center">
          <p className="text-destructive font-medium mb-2">Error: {error}</p>
          <Button variant="outline" onClick={fetchProjects}>
            Coba Lagi
          </Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
            <FolderKanban size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Belum Ada Proyek</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-sm">
              Buat proyek pertama Anda untuk mulai mengorganisasikan tugas-tugas tim agensi.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            Buat Proyek
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => setDetailProject(p)}
              className="group border bg-card hover:bg-accent/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between hover:-translate-y-0.5 cursor-pointer"
            >
              <div className="w-full h-36 overflow-hidden bg-muted/60 relative flex items-center justify-center border-b">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground/60">
                    <FolderKanban size={28} />
                    <span className="text-xs font-medium tracking-wide">Gambar Tidak Ada</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-lg leading-tight tracking-tight text-card-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    {getStatusBadge(p.status)}
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-3 min-h-[3.75rem]">
                    {p.description || 'Tidak ada deskripsi proyek.'}
                  </p>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">
                    {p._count.tickets} Tiket Tugas
                  </span>

                  <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingProject(p)
                      }}
                    >
                      <Edit2 size={14} />
                    </Button>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingProject(p)
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailProject && (
        <ProjectDetailModal
          project={detailProject}
          isOwner={isOwner}
          onClose={() => setDetailProject(null)}
          onEdit={() => setEditingProject(detailProject)}
          onDelete={() => setDeletingProject(detailProject)}
        />
      )}

      {isCreateOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => {
            setIsCreateOpen(false)
            fetchProjects()
          }}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={() => {
            setEditingProject(null)
            fetchProjects()
          }}
        />
      )}

      {deletingProject && (
        <DeleteProjectModal
          projectName={deletingProject.name}
          loading={deleting}
          onClose={() => setDeletingProject(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}
