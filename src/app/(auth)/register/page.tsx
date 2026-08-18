'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    position: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Gagal mendaftar')
      setLoading(false)
      return
    }

    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 rounded-xl border bg-card shadow-sm">
        <div className="mb-6">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
           Arul-Pani Agency
          </span>
          <h1 className="text-2xl font-bold mt-2 mb-1">Daftar Akun Tim</h1>
          <p className="text-muted-foreground text-sm">
            Bergabunglah sebagai anggota tim di Arul-Pani Agency
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama Lengkap *</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Fahrul Nurdiansyah"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Jabatan / Posisi</label>
            <input
              type="text"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="UI/UX Designer, Developer, dll."
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="nama@arul-pani.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password *</label>
            <input
              type="password"
              className="w-full mt-1 px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Minimal 8 karakter"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </Button>
        </form>

        <p className="text-sm text-center text-muted-foreground mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}