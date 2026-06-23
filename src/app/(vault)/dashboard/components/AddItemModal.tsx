'use client'

import { useState } from 'react'
import { encrypt, generatePassword, passwordStrength } from '@/lib/crypto'
import { createVaultItem, type VaultItemRow, type VaultItemType } from '@/app/actions/vault'
import styles from './AddItemModal.module.css'

const TYPE_META: Record<VaultItemType, { label: string; icon: string; color: string }> = {
  password: { label: 'Password', icon: '🔑', color: 'var(--color-password)' },
  api_key: { label: 'API Key', icon: '⚙️', color: 'var(--color-api-key)' },
  note: { label: 'Secure Note', icon: '📝', color: 'var(--color-note)' },
  card: { label: 'Card', icon: '💳', color: 'var(--color-credit-card)' },
}

interface AddItemModalProps {
  type: VaultItemType
  masterPassword: string
  onClose: () => void
  onAdded: (item: VaultItemRow) => void
}

export default function AddItemModal({ type, masterPassword, onClose, onAdded }: AddItemModalProps) {
  const [activeType, setActiveType] = useState<VaultItemType>(type)
  const [title, setTitle] = useState('')
  const [fields, setFields] = useState({
    username: '', password: '', url: '', notes: '',
    keyName: '', keyValue: '', service: '',
    noteText: '',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '', cardType: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showCvv, setShowCvv] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tags, setTags] = useState('')
  const [favorite, setFavorite] = useState(false)

  const meta = TYPE_META[activeType]
  const strength = fields.password ? passwordStrength(fields.password) : null
  const strengthClasses = ['weak', 'fair', 'good', 'strong']

  function handleGenPassword() {
    const generated = generatePassword(24, { upper: true, lower: true, numbers: true, symbols: true })
    setFields((f) => ({ ...f, password: generated }))
    setShowPassword(true)
  }

  function getPayload(): Record<string, string> {
    switch (activeType) {
      case 'password':
        return { username: fields.username, password: fields.password, url: fields.url, notes: fields.notes }
      case 'api_key':
        return { keyName: fields.keyName, keyValue: fields.keyValue, service: fields.service, notes: fields.notes }
      case 'note':
        return { noteText: fields.noteText }
      case 'card':
        return { cardName: fields.cardName, cardNumber: fields.cardNumber, cardExpiry: fields.cardExpiry, cardCvv: fields.cardCvv, cardType: fields.cardType }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required.'); return }
    setError('')
    setLoading(true)

    try {
      const payload = getPayload()
      const encrypted = await encrypt(JSON.stringify(payload), masterPassword)
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)

      const result = await createVaultItem({
        item_type: activeType,
        title: title.trim(),
        encrypted_data: encrypted,
        tags: tagList,
        favorite,
      })

      if (result.error) { setError(result.error); return }
      onAdded(result.data!)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
            <span>{meta.icon}</span> Add {meta.label}
          </h2>
          <button className="modal-close" onClick={onClose} id="add-item-close-btn">✕</button>
        </div>

        {/* Type Switcher */}
        <div className={styles.typeTabs}>
          {(Object.keys(TYPE_META) as VaultItemType[]).map((t) => (
            <button
              key={t}
              className={`${styles.typeTab} ${activeType === t ? styles.typeTabActive : ''}`}
              onClick={() => setActiveType(t)}
              style={activeType === t ? { color: TYPE_META[t].color } : {}}
              type="button"
            >
              <span>{TYPE_META[t].icon}</span>
              <span>{TYPE_META[t].label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
              ⚠ {error}
            </div>
          )}

          {/* Common: Title */}
          <div className="form-group">
            <label htmlFor="item-title" className="form-label">Title *</label>
            <input id="item-title" type="text" className="form-input" placeholder={`E.g. ${activeType === 'password' ? 'GitHub Account' : activeType === 'api_key' ? 'OpenAI API Key' : activeType === 'note' ? 'SSH Key Backup' : 'Visa Card'}`} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          {/* Password fields */}
          {activeType === 'password' && (<>
            <div className="form-group">
              <label htmlFor="item-username" className="form-label">Username / Email</label>
              <input id="item-username" type="text" className="form-input" placeholder="username@example.com" value={fields.username} onChange={(e) => setFields((f) => ({ ...f, username: e.target.value }))} autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="item-password" className="form-label">Password</label>
              <div className="form-input-icon-wrap has-action">
                <span className="input-icon">🔒</span>
                <input id="item-password" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="Password" value={fields.password} onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))} autoComplete="off" style={{ paddingRight: '90px' }} />
                <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px' }}>
                  <button type="button" className="input-action" style={{ position: 'static', transform: 'none' }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁'}</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenPassword} title="Generate password" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>⚡ Gen</button>
                </div>
              </div>
              {strength && (
                <div>
                  <div className="strength-bar"><div className={`strength-bar-fill ${strengthClasses[strength.score]}`} /></div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>Strength: <strong>{strength.label}</strong></p>
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="item-url" className="form-label">Website URL</label>
              <input id="item-url" type="url" className="form-input" placeholder="https://example.com" value={fields.url} onChange={(e) => setFields((f) => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="item-notes" className="form-label">Notes</label>
              <textarea id="item-notes" className="form-textarea" placeholder="Additional notes…" value={fields.notes} onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </>)}

          {/* API Key fields */}
          {activeType === 'api_key' && (<>
            <div className="form-group">
              <label htmlFor="item-service" className="form-label">Service / Platform</label>
              <input id="item-service" type="text" className="form-input" placeholder="OpenAI, Stripe, AWS…" value={fields.service} onChange={(e) => setFields((f) => ({ ...f, service: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="item-key-name" className="form-label">Key Name / Label</label>
              <input id="item-key-name" type="text" className="form-input" placeholder="Production API Key" value={fields.keyName} onChange={(e) => setFields((f) => ({ ...f, keyName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label htmlFor="item-key-value" className="form-label">API Key *</label>
              <div className="form-input-icon-wrap has-action">
                <span className="input-icon" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', top: '50%' }}>KEY</span>
                <input id="item-key-value" type={showPassword ? 'text' : 'password'} className="form-input" placeholder="sk-…" value={fields.keyValue} onChange={(e) => setFields((f) => ({ ...f, keyValue: e.target.value }))} autoComplete="off" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }} />
                <button type="button" className="input-action" onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🙈' : '👁'}</button>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="item-api-notes" className="form-label">Notes</label>
              <textarea id="item-api-notes" className="form-textarea" placeholder="Permissions, expiry, environment…" value={fields.notes} onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </>)}

          {/* Note fields */}
          {activeType === 'note' && (
            <div className="form-group">
              <label htmlFor="item-note-text" className="form-label">Secure Note *</label>
              <textarea id="item-note-text" className="form-textarea" style={{ minHeight: '160px' }} placeholder="Write your secure note here…" value={fields.noteText} onChange={(e) => setFields((f) => ({ ...f, noteText: e.target.value }))} required />
            </div>
          )}

          {/* Card fields */}
          {activeType === 'card' && (<>
            <div className="form-group">
              <label htmlFor="item-card-name" className="form-label">Cardholder Name</label>
              <input id="item-card-name" type="text" className="form-input" placeholder="Jane Doe" value={fields.cardName} onChange={(e) => setFields((f) => ({ ...f, cardName: e.target.value }))} autoComplete="off" />
            </div>
            <div className="form-group">
              <label htmlFor="item-card-number" className="form-label">Card Number</label>
              <input id="item-card-number" type="text" className="form-input mono" placeholder="•••• •••• •••• ••••" maxLength={19} value={fields.cardNumber} onChange={(e) => setFields((f) => ({ ...f, cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }))} autoComplete="off" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label htmlFor="item-card-expiry" className="form-label">Expiry</label>
                <input id="item-card-expiry" type="text" className="form-input" placeholder="MM/YY" maxLength={5} value={fields.cardExpiry} onChange={(e) => setFields((f) => ({ ...f, cardExpiry: e.target.value }))} autoComplete="off" />
              </div>
              <div className="form-group">
                <label htmlFor="item-card-cvv" className="form-label">CVV</label>
                <div className="form-input-icon-wrap has-action">
                  <input id="item-card-cvv" type={showCvv ? 'text' : 'password'} className="form-input" placeholder="•••" maxLength={4} value={fields.cardCvv} onChange={(e) => setFields((f) => ({ ...f, cardCvv: e.target.value }))} autoComplete="off" />
                  <button type="button" className="input-action" onClick={() => setShowCvv(!showCvv)}>{showCvv ? '🙈' : '👁'}</button>
                </div>
              </div>
            </div>
          </>)}

          {/* Common: Tags & Favorite */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
            <div className="form-group">
              <label htmlFor="item-tags" className="form-label">Tags</label>
              <input id="item-tags" type="text" className="form-input" placeholder="work, personal, finance (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingBottom: '10px', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              <input type="checkbox" checked={favorite} onChange={(e) => setFavorite(e.target.checked)} id="item-favorite" style={{ accentColor: 'var(--color-primary)' }} />
              ⭐ Favorite
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} style={{ flex: 2 }} disabled={loading} id="save-item-btn">
              {loading ? <><span className="spinner" /> Encrypting &amp; Saving…</> : '🔒 Save Encrypted'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
