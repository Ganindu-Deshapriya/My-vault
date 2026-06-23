'use client'

import { useState } from 'react'
import styles from './UnlockModal.module.css'

interface UnlockModalProps {
  isSetup: boolean
  onUnlock: (password: string) => Promise<{ error?: string }>
  onSetup: (password: string) => Promise<{ error?: string }>
}

export default function UnlockModal({ isSetup, onUnlock, onSetup }: UnlockModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isSetup) {
      if (password.length < 8) {
        setError('Master password must be at least 8 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setLoading(true)
    try {
      const fn = isSetup ? onSetup : onUnlock
      const result = await fn(password)
      if (result.error) {
        setError(result.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className={`modal ${styles.unlockModal}`}>
        <div className={styles.iconWrap}>
          <span className={styles.icon}>{isSetup ? '🛡️' : '🔒'}</span>
        </div>

        <h2 className={styles.title}>
          {isSetup ? 'Set Master Password' : 'Unlock Vault'}
        </h2>
        <p className={styles.description}>
          {isSetup
            ? 'Create a strong master password to encrypt your vault. This password is never sent to any server — only you know it.'
            : 'Enter your master password to decrypt and access your vault items.'}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: 'var(--color-danger)',
              fontSize: '0.875rem',
            }} role="alert">
              ⚠ {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="master-password" className="form-label">
              Master Password
            </label>
            <div className="form-input-icon-wrap has-action">
              <span className="input-icon">🔑</span>
              <input
                id="master-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={isSetup ? 'Create a strong master password' : 'Enter your master password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete={isSetup ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {isSetup && (
            <div className="form-group">
              <label htmlFor="confirm-master-password" className="form-label">
                Confirm Master Password
              </label>
              <div className="form-input-icon-wrap">
                <span className="input-icon">🔑</span>
                <input
                  id="confirm-master-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${confirmPassword && confirmPassword !== password ? 'error' : ''}`}
                  placeholder="Same master password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {isSetup && (
            <div className={styles.warningBox}>
              <strong>⚠ Important:</strong> If you forget your master password, your vault data cannot be recovered. There is no reset option.
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            id="unlock-modal-submit"
          >
            {loading
              ? <><span className="spinner" /> {isSetup ? 'Setting up…' : 'Unlocking…'}</>
              : isSetup ? '🛡️ Set Master Password' : '🔓 Unlock Vault'
            }
          </button>
        </form>
      </div>
    </div>
  )
}
