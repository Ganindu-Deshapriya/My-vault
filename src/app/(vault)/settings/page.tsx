'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'qrcode'
import Image from 'next/image'
import {
  enrollTotp, challengeTotp, verifyTotp, getMfaFactors, unenrollTotp,
  getUser, getProfile,
} from '@/app/actions/auth'
import { signOut } from '@/app/actions/auth'
import styles from './settings.module.css'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<{ full_name: string; totp_enabled: boolean } | null>(null)
  const [totpFactors, setTotpFactors] = useState<{ id: string; status: string }[]>([])
  const [enrollState, setEnrollState] = useState<{
    factorId: string; qrCodeUrl: string; secret: string; challengeId: string
  } | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [tab, setTab] = useState<'security' | 'account'>('security')

  useEffect(() => {
    async function load() {
      const u = await getUser()
      if (!u) { router.push('/login'); return }
      setUser(u)
      const [prof, { factors }] = await Promise.all([getProfile(u.id), getMfaFactors()])
      setProfile(prof)
      setTotpFactors(factors || [])
    }
    load()
  }, [router])

  const verifiedFactor = totpFactors.find((f) => f.status === 'verified')

  async function handleEnroll2FA() {
    setLoading(true)
    setMessage(null)
    try {
      const result = await enrollTotp()
      if (result.error) { setMessage({ text: result.error, type: 'error' }); return }

      // Generate QR code image from the TOTP URI
      const qrUrl = await QRCode.toDataURL(result.totpUri!, { width: 200, margin: 2, color: { dark: '#fff', light: '#0d1424' } })
      const challengeResult = await challengeTotp(result.id!)
      if (challengeResult.error) { setMessage({ text: challengeResult.error, type: 'error' }); return }

      setEnrollState({ factorId: result.id!, qrCodeUrl: qrUrl, secret: result.secret!, challengeId: challengeResult.challengeId! })
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyEnrollment() {
    if (!enrollState || otpCode.length !== 6) return
    setLoading(true)
    try {
      const result = await verifyTotp(enrollState.factorId, enrollState.challengeId, otpCode)
      if (result.error) { setMessage({ text: result.error, type: 'error' }); return }
      setMessage({ text: '2FA enabled successfully!', type: 'success' })
      setEnrollState(null)
      setOtpCode('')
      const { factors } = await getMfaFactors()
      setTotpFactors(factors || [])
    } finally {
      setLoading(false)
    }
  }

  async function handleUnenroll() {
    if (!verifiedFactor) return
    setLoading(true)
    try {
      const result = await unenrollTotp(verifiedFactor.id)
      if (result.error) { setMessage({ text: result.error, type: 'error' }); return }
      setMessage({ text: '2FA disabled.', type: 'success' })
      setTotpFactors([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account, security, and vault preferences</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['security', 'account'] as const).map((t) => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'security' ? '🛡️ Security' : '👤 Account'}
          </button>
        ))}
      </div>

      {message && (
        <div className={`${styles.banner} ${message.type === 'success' ? styles.bannerSuccess : styles.bannerError}`} role="alert">
          {message.type === 'success' ? '✅' : '⚠'} {message.text}
        </div>
      )}

      {tab === 'security' && (
        <div className={styles.section}>
          {/* 2FA Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🔐</div>
              <div>
                <h2 className={styles.cardTitle}>Two-Factor Authentication</h2>
                <p className={styles.cardDescription}>
                  Add an extra layer of security with an authenticator app (TOTP)
                </p>
              </div>
              <div className={styles.cardBadge}>
                {verifiedFactor
                  ? <span style={{ color: 'var(--color-success)', fontSize: '0.8125rem', fontWeight: 600 }}>✅ Enabled</span>
                  : <span style={{ color: 'var(--color-text-dim)', fontSize: '0.8125rem' }}>Disabled</span>
                }
              </div>
            </div>

            {!enrollState && !verifiedFactor && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                  Using an authenticator app (Google Authenticator, Authy, 1Password, etc.), scan the QR code to enable 2FA.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={handleEnroll2FA}
                  disabled={loading}
                  id="enable-2fa-btn"
                >
                  {loading ? <><span className="spinner" /> Setting up…</> : '🔐 Enable 2FA'}
                </button>
              </div>
            )}

            {enrollState && (
              <div className={styles.enrollFlow}>
                <h3 style={{ color: 'var(--color-text)', marginBottom: '12px' }}>Scan this QR Code</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '20px' }}>
                  Open your authenticator app and scan the QR code below.
                </p>
                <div className={styles.qrWrap}>
                  <Image src={enrollState.qrCodeUrl} alt="2FA QR Code" width={200} height={200} />
                </div>
                <details className={styles.secretDetails}>
                  <summary>Can&apos;t scan? Enter manually</summary>
                  <code className={styles.secret}>{enrollState.secret}</code>
                </details>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label htmlFor="verify-otp-code" className="form-label">Enter 6-digit code from your app</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      id="verify-otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      className="form-input mono"
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{ letterSpacing: '0.3em', fontSize: '1.25rem', textAlign: 'center', maxWidth: '160px' }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleVerifyEnrollment}
                      disabled={loading || otpCode.length !== 6}
                      id="confirm-2fa-btn"
                    >
                      {loading ? <span className="spinner" /> : 'Verify & Enable'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setEnrollState(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {verifiedFactor && !enrollState && (
              <div style={{ marginTop: '20px' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
                  2FA is active. You will be prompted for a code every time you sign in.
                </p>
                <button className="btn btn-danger" onClick={handleUnenroll} disabled={loading} id="disable-2fa-btn">
                  {loading ? <span className="spinner" /> : '🔓 Disable 2FA'}
                </button>
              </div>
            )}
          </div>

          {/* Encryption info card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>🔒</div>
              <div>
                <h2 className={styles.cardTitle}>End-to-End Encryption</h2>
                <p className={styles.cardDescription}>
                  Your vault data is encrypted using AES-256-GCM with a key derived from your master password via PBKDF2 (310,000 iterations). Your master password never leaves your device.
                </p>
              </div>
            </div>
            <div className={styles.encInfo}>
              <div className={styles.encDetail}><strong>Algorithm</strong><span>AES-256-GCM</span></div>
              <div className={styles.encDetail}><strong>Key Derivation</strong><span>PBKDF2-SHA256</span></div>
              <div className={styles.encDetail}><strong>Iterations</strong><span>310,000</span></div>
              <div className={styles.encDetail}><strong>Server sees</strong><span>Encrypted blobs only</span></div>
            </div>
          </div>
        </div>
      )}

      {tab === 'account' && (
        <div className={styles.section}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>👤</div>
              <div>
                <h2 className={styles.cardTitle}>Account Info</h2>
                <p className={styles.cardDescription}>Your account details</p>
              </div>
            </div>
            <div className={styles.encInfo} style={{ marginTop: '20px' }}>
              <div className={styles.encDetail}><strong>Name</strong><span>{profile?.full_name || '—'}</span></div>
              <div className={styles.encDetail}><strong>Email</strong><span>{user?.email || '—'}</span></div>
              <div className={styles.encDetail}><strong>2FA</strong><span>{verifiedFactor ? '✅ Enabled' : '❌ Disabled'}</span></div>
            </div>
          </div>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>↩</div>
              <div>
                <h2 className={styles.cardTitle}>Sign Out</h2>
                <p className={styles.cardDescription}>Sign out from all devices</p>
              </div>
            </div>
            <button className="btn btn-danger" style={{ marginTop: '20px' }} onClick={async () => await signOut()} id="sign-out-settings-btn">
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
