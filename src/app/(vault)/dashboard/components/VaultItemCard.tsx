'use client'

import { useState } from 'react'
import { deleteVaultItem, toggleFavorite, updateVaultItem, type VaultItemRow, type VaultItemType } from '@/app/actions/vault'
import { encrypt } from '@/lib/crypto'
import styles from './VaultItemCard.module.css'

const TYPE_META: Record<VaultItemType, { icon: string; color: string; badge: string }> = {
  password: { icon: '🔑', color: 'var(--color-password)', badge: 'badge-password' },
  api_key: { icon: '⚙️', color: 'var(--color-api-key)', badge: 'badge-api_key' },
  note: { icon: '📝', color: 'var(--color-note)', badge: 'badge-note' },
  card: { icon: '💳', color: 'var(--color-credit-card)', badge: 'badge-card' },
}

interface VaultItemCardProps {
  item: VaultItemRow
  decryptedData?: Record<string, string>
  masterPassword: string
  onDeleted: (id: string) => void
  onUpdated: (item: VaultItemRow) => void
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

function maskSecret(value: string, visible: boolean) {
  if (!value) return '—'
  if (visible) return value
  return '•'.repeat(Math.min(value.length, 20))
}

function getDisplayFields(type: VaultItemType, data: Record<string, string>, revealed: boolean) {
  switch (type) {
    case 'password':
      return [
        { label: 'Username', value: data.username || '—', secret: false },
        { label: 'Password', value: maskSecret(data.password || '', revealed), secret: true, raw: data.password },
        ...(data.url ? [{ label: 'URL', value: data.url, secret: false, isUrl: true }] : []),
      ]
    case 'api_key':
      return [
        { label: 'Service', value: data.service || '—', secret: false },
        { label: 'Key Name', value: data.keyName || '—', secret: false },
        { label: 'API Key', value: maskSecret(data.keyValue || '', revealed), secret: true, raw: data.keyValue },
      ]
    case 'note':
      return [{ label: 'Note', value: revealed ? data.noteText : '••••••••••••••', secret: true, raw: data.noteText }]
    case 'card':
      return [
        { label: 'Cardholder', value: data.cardName || '—', secret: false },
        { label: 'Card Number', value: revealed ? data.cardNumber : `•••• •••• •••• ${(data.cardNumber || '').slice(-4) || '••••'}`, secret: true, raw: data.cardNumber },
        { label: 'Expiry', value: data.cardExpiry || '—', secret: false },
      ]
    default:
      return []
  }
}

export default function VaultItemCard({ item, decryptedData, masterPassword, onDeleted, onUpdated, onToast }: VaultItemCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isFavorite, setIsFavorite] = useState(item.favorite)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(item.title)
  const [saving, setSaving] = useState(false)

  const meta = TYPE_META[item.item_type]
  const isLoading = !decryptedData
  const hasError = decryptedData?.error === 'Decryption failed'
  const fields = decryptedData && !hasError ? getDisplayFields(item.item_type, decryptedData, revealed) : []

  async function handleCopy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value)
      onToast(`${label} copied to clipboard`, 'success')
      // Auto-clear clipboard after 30 seconds
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText('')
        } catch {}
      }, 30000)
    } catch {
      onToast('Failed to copy', 'error')
    }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    const result = await deleteVaultItem(item.id)
    setDeleting(false)
    if (result.error) { onToast(result.error, 'error'); return }
    onDeleted(item.id)
  }

  async function handleFavoriteToggle() {
    const newFav = !isFavorite
    setIsFavorite(newFav)
    await toggleFavorite(item.id, newFav)
  }

  async function handleSaveTitle() {
    if (!editTitle.trim()) return
    setSaving(true)
    const result = await updateVaultItem(item.id, { title: editTitle.trim() })
    setSaving(false)
    if (result.error) { onToast(result.error, 'error'); return }
    onUpdated(result.data!)
    setEditing(false)
    onToast('Title updated!', 'success')
  }

  return (
    <div className={`${styles.card} ${confirmDelete ? styles.cardDanger : ''}`}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.typeIcon} style={{ background: `${meta.color}18`, color: meta.color }}>
          {meta.icon}
        </div>
        <div className={styles.titleArea}>
          {editing ? (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                className="form-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ fontSize: '0.875rem', padding: '4px 8px', height: 'auto' }}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditing(false) }}
              />
              <button className="btn btn-primary btn-sm" onClick={handleSaveTitle} disabled={saving}>
                {saving ? <span className="spinner" style={{ width: 12, height: 12 }} /> : '✓'}
              </button>
            </div>
          ) : (
            <h3 className={styles.title} onDoubleClick={() => setEditing(true)} title="Double-click to edit">{item.title}</h3>
          )}
          <span className={`badge ${meta.badge}`}>{item.item_type === 'api_key' ? 'API Key' : item.item_type.charAt(0).toUpperCase() + item.item_type.slice(1)}</span>
        </div>
        <div className={styles.cardActions}>
          <button
            className={`${styles.iconBtn} ${isFavorite ? styles.iconBtnActive : ''}`}
            onClick={handleFavoriteToggle}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setRevealed(!revealed)}
            title={revealed ? 'Hide secrets' : 'Reveal secrets'}
            aria-label="Toggle reveal"
          >
            {revealed ? '🙈' : '👁'}
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => setEditing(!editing)}
            title="Edit title"
            aria-label="Edit"
          >
            ✏️
          </button>
          <button
            className={`${styles.iconBtn} ${confirmDelete ? styles.iconBtnDanger : ''}`}
            onClick={handleDelete}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete item'}
            aria-label="Delete item"
            disabled={deleting}
          >
            {deleting ? <span className="spinner" style={{ width: 14, height: 14 }} /> : confirmDelete ? '✓?' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        {isLoading ? (
          <>
            <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 16, width: '40%', borderRadius: 4, marginTop: 8 }} />
          </>
        ) : hasError ? (
          <p style={{ color: 'var(--color-danger)', fontSize: '0.8125rem' }}>⚠ Decryption failed — wrong master password?</p>
        ) : (
          <div className={styles.fields}>
            {fields.map((field) => (
              <div key={field.label} className={styles.field}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <div className={styles.fieldValue}>
                  {field.isUrl ? (
                    <a href={field.value} target="_blank" rel="noopener noreferrer" className={styles.fieldLink} title={field.value}>
                      {field.value.replace(/^https?:\/\//, '').slice(0, 35)}{field.value.length > 38 ? '…' : ''}
                    </a>
                  ) : (
                    <span className={`${styles.fieldText} ${field.secret && !revealed ? 'mono' : ''}`} title={revealed || !field.secret ? field.value : undefined}>
                      {field.value}
                    </span>
                  )}
                  {field.secret && field.raw && (
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopy(field.raw!, field.label)}
                      title={`Copy ${field.label}`}
                    >
                      📋
                    </button>
                  )}
                  {!field.secret && field.value !== '—' && (
                    <button
                      className={styles.copyBtn}
                      onClick={() => handleCopy(field.value, field.label)}
                      title={`Copy ${field.label}`}
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className={styles.tags}>
          {item.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      )}

      {/* Confirm delete banner */}
      {confirmDelete && !deleting && (
        <div className={styles.deleteBanner}>
          <span>⚠ This cannot be undone.</span>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
        </div>
      )}

      {/* Updated timestamp */}
      <div className={styles.timestamp}>
        Updated {new Date(item.updated_at).toLocaleDateString()}
      </div>
    </div>
  )
}
