"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side providers wrapper.
 * SessionProvider diperlukan agar useSession() dan signOut() dari next-auth/react bekerja.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
