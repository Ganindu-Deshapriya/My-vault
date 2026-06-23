'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from '../auth.module.css'
import { signUp, resendVerification } from '@/app/actions/auth'
import { passwordStrength } from '@/lib/crypto'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSent, setResendSent] = useState(false)

  const strength = password ? passwordStrength(password) : null
  const strengthClasses = ['weak', 'fair', 'good', 'strong']

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const result = await signUp(email, password, fullName)
      if (result.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setResendLoading(true)
    setResendSent(false)
    try {
      await resendVerification(email)
      setResendSent(true)
      // 60-second cooldown to prevent spam
      setResendCooldown(60)
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.card}>
        <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📧</div>
          <h1 className={styles.heading} style={{ marginBottom: '8px' }}>Check your inbox</h1>
          <p className={styles.subheading} style={{ marginBottom: '0' }}>
            We sent a confirmation link to
          </p>
          <p style={{ fontWeight: 600, color: 'var(--color-accent)', margin: '6px 0 20px', wordBreak: 'break-all' }}>
            {email}
          </p>
        </div>

        <ol style={{ paddingLeft: '20px', color: 'var(--color-text-dim)', lineHeight: '2', marginBottom: '24px', fontSize: '0.9rem' }}>
          <li>Open the email from <strong style={{ color: 'var(--color-text)' }}>Vault App</strong></li>
          <li>Click <strong style={{ color: 'var(--color-text)' }}>Confirm your email</strong></li>
          <li>You&apos;ll be signed in automatically</li>
        </ol>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {resendSent ? (
            <div className={styles.successBanner} style={{ justifyContent: 'center' }}>
              ✅ Confirmation email resent!
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className="btn btn-full"
              style={{ background: 'var(--color-surface-2)' }}
            >
              {resendLoading
                ? 'Sending…'
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend confirmation email'}
            </button>
          )}

          <Link
            href="/login"
            style={{ textAlign: 'center', color: 'var(--color-text-dim)', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            Already confirmed? <span style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Sign in</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <h1 className={styles.heading}>Create account</h1>
      <p className={styles.subheading}>Set up your secure, encrypted vault</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fullName" className="form-label">Full name</label>
          <div className="form-input-icon-wrap">
            <span className="input-icon">👤</span>
            <input
              id="fullName"
              type="text"
              className="form-input"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="reg-email" className="form-label">Email address</label>
          <div className="form-input-icon-wrap">
            <span className="input-icon">✉</span>
            <input
              id="reg-email"
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
          <label htmlFor="reg-password" className="form-label">Password</label>
          <div className="form-input-icon-wrap has-action">
            <span className="input-icon">🔒</span>
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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
          {strength && (
            <div>
              <div className="strength-bar">
                <div className={`strength-bar-fill ${strengthClasses[strength.score]}`} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>
                Password strength: <strong style={{ color: strength.score >= 2 ? 'var(--color-success)' : 'var(--color-warning)' }}>{strength.label}</strong>
              </p>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
          <div className="form-input-icon-wrap">
            <span className="input-icon">🔒</span>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${confirmPassword && confirmPassword !== password ? 'error' : ''}`}
              placeholder="Same password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="form-error">⚠ Passwords do not match</p>
          )}
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
          disabled={loading}
          id="register-submit-btn"
        >
          {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
        </button>
      </form>

      <p className={styles.switchLink}>
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  )
}
