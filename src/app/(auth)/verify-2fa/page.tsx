'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import styles from '../auth.module.css'
import { verifyTotp } from '@/app/actions/auth'

export default function Verify2faPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setCode(newCode)
    const nextEmpty = newCode.findIndex((c) => !c)
    inputRefs.current[nextEmpty !== -1 ? nextEmpty : 5]?.focus()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const factorId = sessionStorage.getItem('mfa_factor_id')
      const challengeId = sessionStorage.getItem('mfa_challenge_id')

      if (!factorId || !challengeId) {
        setError('Session expired. Please sign in again.')
        router.push('/login')
        return
      }

      const result = await verifyTotp(factorId, challengeId, fullCode)
      if (result.error) {
        setError(result.error)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
        return
      }

      sessionStorage.removeItem('mfa_factor_id')
      sessionStorage.removeItem('mfa_challenge_id')
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.card}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '1.75rem'
        }}>
          🔐
        </div>
        <h1 className={styles.heading} style={{ fontSize: '1.5rem' }}>Two-Factor Authentication</h1>
        <p className={styles.subheading} style={{ marginBottom: 0 }}>
          Enter the 6-digit code from your authenticator app
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              id={`otp-input-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              style={{
                width: '52px',
                height: '60px',
                textAlign: 'center',
                fontSize: '1.5rem',
                fontWeight: '700',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${digit ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                outline: 'none',
                transition: 'all var(--transition-fast)',
                caretColor: 'var(--color-primary)',
              }}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="submit"
          className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
          disabled={loading || code.join('').length !== 6}
          id="verify-2fa-btn"
        >
          {loading ? <><span className="spinner" /> Verifying…</> : 'Verify Code'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--color-text-dim)', fontSize: '0.875rem' }}>
        Lost access to your authenticator? Contact support.
      </p>
    </div>
  )
}
