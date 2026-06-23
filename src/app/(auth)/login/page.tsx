'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { signIn, getMfaFactors, challengeTotp } from '@/app/actions/auth'
import { resendVerification } from '@/app/actions/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setEmailNotConfirmed(false)
    setResendSent(false)
    setLoading(true)

    try {
      const result = await signIn(email, password)
      if (result.error) {
        // Supabase returns this exact string when email isn't confirmed
        if (
          result.error.toLowerCase().includes('email not confirmed') ||
          result.error.toLowerCase().includes('email_not_confirmed')
        ) {
          setEmailNotConfirmed(true)
        } else {
          setError(result.error)
        }
        return
      }

      // Check if user has TOTP enrolled
      const { factors } = await getMfaFactors()
      const totpFactor = factors.find((f: { status: string }) => f.status === 'verified')

      if (totpFactor) {
        // Start a challenge and redirect to 2FA page
        const challenge = await challengeTotp(totpFactor.id)
        if (challenge.error) {
          setError(challenge.error)
          return
        }
        // Store factor and challenge IDs in sessionStorage for the 2FA page
        sessionStorage.setItem('mfa_factor_id', totpFactor.id)
        sessionStorage.setItem('mfa_challenge_id', challenge.challengeId!)
        router.push('/verify-2fa')
      } else {
        router.push('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    try {
      await resendVerification(email)
      setResendSent(true)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>Welcome back</h1>
      <p className={styles.subheading}>Sign in to access your secure vault</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {emailNotConfirmed && (
          <div className={styles.errorBanner} role="alert" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
            <div><span>📧</span> <strong>Email not verified.</strong> Please check your inbox and click the confirmation link before signing in.</div>
            {resendSent ? (
              <span style={{ color: 'var(--color-success)', fontSize: '0.85rem' }}>✅ Verification email resent!</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || !email}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', textDecoration: 'underline' }}
              >
                {resendLoading ? 'Sending…' : 'Resend verification email'}
              </button>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email address</label>
          <div className="form-input-icon-wrap">
            <span className="input-icon">✉</span>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div className="form-input-icon-wrap has-action">
            <span className="input-icon">🔒</span>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
          disabled={loading}
          id="login-submit-btn"
        >
          {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
        </button>
      </form>

      <p className={styles.switchLink}>
        Don&apos;t have an account? <Link href="/register">Create one</Link>
      </p>
    </div>
  )
}
