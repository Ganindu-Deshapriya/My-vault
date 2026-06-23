import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VaultClientLayout from './VaultClientLayout'
import Sidebar from './dashboard/components/Sidebar'
import styles from './vault.module.css'

export default async function VaultLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <VaultClientLayout>
      <div className={styles.appLayout}>
        <Sidebar user={user} profile={profile} />
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </VaultClientLayout>
  )
}
