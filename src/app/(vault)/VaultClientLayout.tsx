'use client'

import { MasterKeyProvider } from '@/lib/masterKeyContext'

export default function VaultClientLayout({ children }: { children: React.ReactNode }) {
  return <MasterKeyProvider>{children}</MasterKeyProvider>
}
