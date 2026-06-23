'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { useMasterKey } from '@/lib/masterKeyContext'
import styles from './Sidebar.module.css'
import type { User } from '@supabase/supabase-js'

const NAV_ITEMS = [
  { href: '/dashboard', icon: '🗄️', label: 'All Items' },
  { href: '/dashboard?type=password', icon: '🔑', label: 'Passwords' },
  { href: '/dashboard?type=api_key', icon: '⚙️', label: 'API Keys' },
  { href: '/dashboard?type=note', icon: '📝', label: 'Secure Notes' },
  { href: '/dashboard?type=card', icon: '💳', label: 'Cards' },
  { href: '/dashboard?favorite=true', icon: '⭐', label: 'Favorites' },
]

interface SidebarProps {
  user: User
  profile: { full_name: string; totp_enabled: boolean } | null
}

export default function Sidebar({ user, profile }: SidebarProps) {
  const pathname = usePathname()
  const { isUnlocked, lock } = useMasterKey()

  const initials = (profile?.full_name || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#sidebarLogoGrad)" />
            <path d="M16 7C12.134 7 9 10.134 9 14v1H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1v-1c0-3.866-3.134-7-7-7zm0 2c2.761 0 5 2.239 5 5v1h-10v-1c0-2.761 2.239-5 5-5zm0 9a2 2 0 0 1 1 3.732V23h-2v-1.268A2 2 0 0 1 16 18z" fill="white"/>
            <defs>
              <linearGradient id="sidebarLogoGrad" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#4f46e5"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className={styles.logoText}>My-Vault</span>
        {isUnlocked && <span className={styles.unlockBadge} title="Vault unlocked">🔓</span>}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.includes(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className={styles.divider} />

      {/* Settings link */}
      <div className={styles.bottomNav}>
        <Link href="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.navItemActive : ''}`}>
          <span className={styles.navIcon}>⚙️</span>
          <span>Settings</span>
        </Link>
        {isUnlocked && (
          <button className={styles.lockBtn} onClick={lock} title="Lock vault">
            <span>🔒</span>
            <span>Lock Vault</span>
          </button>
        )}
      </div>

      {/* User avatar */}
      <div className={styles.user}>
        <div className={styles.avatar}>{initials}</div>
        <div className={styles.userInfo}>
          <p className={styles.userName}>{profile?.full_name || 'User'}</p>
          <p className={styles.userEmail}>{user.email}</p>
        </div>
        <button
          className={styles.signOutBtn}
          onClick={async () => { await signOut() }}
          title="Sign out"
          aria-label="Sign out"
        >
          ↩
        </button>
      </div>
    </aside>
  )
}
