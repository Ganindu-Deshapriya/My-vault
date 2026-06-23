import styles from './auth.module.css'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
            <path d="M16 7C12.134 7 9 10.134 9 14v1H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1v-1c0-3.866-3.134-7-7-7zm0 2c2.761 0 5 2.239 5 5v1h-10v-1c0-2.761 2.239-5 5-5zm0 9a2 2 0 0 1 1 3.732V23h-2v-1.268A2 2 0 0 1 16 18z" fill="white"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#4f46e5"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className={styles.brandName}>My-Vault</span>
      </div>
      <main className={styles.main}>
        {children}
      </main>
      <footer className={styles.footer}>
        <p>Protected by AES-256-GCM end-to-end encryption</p>
      </footer>
    </div>
  )
}
