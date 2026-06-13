import { redirect } from 'next/navigation'

/**
 * Root page — redirect ke dashboard.
 * User yang belum login akan di-redirect ke /login oleh middleware.
 */
export default function Home() {
  redirect('/dashboard')
}
