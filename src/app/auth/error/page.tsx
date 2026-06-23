import Link from 'next/link'
import styles from '../../(auth)/auth.module.css'

/**
 * Shown when the email confirmation callback fails (expired/invalid link).
 */
export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { message?: string }
}) {
  const message =
    searchParams.message ??
    'Something went wrong with your confirmation link.'

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div className={styles.card}>
        <div
          className={styles.errorBanner}
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            padding: '24px',
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <div>
            <strong style={{ display: 'block', fontSize: '1.1rem', marginBottom: '8px' }}>
              Confirmation failed
            </strong>
            <span style={{ opacity: 0.85 }}>{decodeURIComponent(message)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
          <Link href="/register" className="btn btn-primary btn-full" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Create a new account
          </Link>
          <Link href="/login" className="btn btn-full" style={{ textAlign: 'center', textDecoration: 'none', background: 'var(--color-surface-2)' }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
