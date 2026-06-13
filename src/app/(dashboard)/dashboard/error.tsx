'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-1">Terjadi Kesalahan</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || 'Terjadi kesalahan yang tidak terduga. Silakan coba lagi.'}
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Coba Lagi
      </Button>
    </div>
  )
}
