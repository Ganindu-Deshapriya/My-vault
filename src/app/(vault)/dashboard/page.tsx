'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMasterKey } from '@/lib/masterKeyContext'
import { verifyMasterPassword, decrypt, createMasterPasswordVerifier } from '@/lib/crypto'
import { getVaultItems, type VaultItemRow } from '@/app/actions/vault'
import { getProfile, getUser, saveMasterPasswordVerifier } from '@/app/actions/auth'
import UnlockModal from './components/UnlockModal'
import AddItemModal from './components/AddItemModal'
import VaultItemCard from './components/VaultItemCard'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const { masterPassword, isUnlocked, unlock } = useMasterKey()
  const [items, setItems] = useState<VaultItemRow[]>([])
  const [decryptedItems, setDecryptedItems] = useState<Map<string, Record<string, string>>>(new Map())
  const [loading, setLoading] = useState(true)
  const [showUnlock, setShowUnlock] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [addItemType, setAddItemType] = useState<'password' | 'api_key' | 'note' | 'card'>('password')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [profile, setProfile] = useState<{ master_password_verifier: string | null; totp_enabled: boolean } | null>(null)
  const [needsMasterSetup, setNeedsMasterSetup] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const user = await getUser()
        if (!user) return
        const [prof, vaultItems] = await Promise.all([getProfile(user.id), getVaultItems()])
        setProfile(prof)
        setItems(vaultItems)

        if (!prof?.master_password_verifier) {
          setNeedsMasterSetup(true)
        } else if (!isUnlocked) {
          setShowUnlock(true)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isUnlocked])

  // Decrypt items when unlocked
  useEffect(() => {
    if (!isUnlocked || !masterPassword) return
    async function decryptAll() {
      const map = new Map<string, Record<string, string>>()
      for (const item of items) {
        try {
          const plain = await decrypt(item.encrypted_data, masterPassword!)
          map.set(item.id, JSON.parse(plain))
        } catch {
          map.set(item.id, { error: 'Decryption failed' })
        }
      }
      setDecryptedItems(map)
    }
    decryptAll()
  }, [isUnlocked, masterPassword, items])

  async function handleUnlock(password: string): Promise<{ error?: string }> {
    if (!profile?.master_password_verifier) return { error: 'No master password set' }
    const valid = await verifyMasterPassword(password, profile.master_password_verifier)
    if (!valid) return { error: 'Incorrect master password' }
    unlock(password)
    setShowUnlock(false)
    return {}
  }

  async function handleSetMasterPassword(password: string): Promise<{ error?: string }> {
    try {
      const user = await getUser()
      if (!user) return { error: 'Not logged in' }
      const verifier = await createMasterPasswordVerifier(password)
      const result = await saveMasterPasswordVerifier(user.id, verifier)
      if (result.error) return { error: result.error }
      unlock(password)
      setNeedsMasterSetup(false)
      setShowUnlock(false)
      showToast('Master password set! Your vault is now unlocked.', 'success')
      return {}
    } catch (e) {
      return { error: String(e) }
    }
  }

  function handleItemAdded(item: VaultItemRow) {
    setItems((prev) => [item, ...prev])
    setShowAddItem(false)
    showToast('Item added to vault!', 'success')
  }

  function handleItemDeleted(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    showToast('Item deleted.', 'info')
  }

  function handleItemUpdated(updated: VaultItemRow) {
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))
    showToast('Item updated!', 'success')
  }

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.item_type === filterType
    const data = decryptedItems.get(item.id)
    const searchText = `${item.title} ${data ? Object.values(data).join(' ') : ''}`.toLowerCase()
    const matchesSearch = !searchQuery || searchText.includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const stats = {
    total: items.length,
    passwords: items.filter((i) => i.item_type === 'password').length,
    apiKeys: items.filter((i) => i.item_type === 'api_key').length,
    notes: items.filter((i) => i.item_type === 'note').length,
    favorites: items.filter((i) => i.favorite).length,
  }

  return (
    <>
      {/* Unlock / Setup Modal */}
      {(showUnlock || needsMasterSetup) && (
        <UnlockModal
          isSetup={needsMasterSetup}
          onUnlock={handleUnlock}
          onSetup={handleSetMasterPassword}
        />
      )}

      {/* Add Item Modal */}
      {showAddItem && isUnlocked && (
        <AddItemModal
          type={addItemType}
          masterPassword={masterPassword!}
          onClose={() => setShowAddItem(false)}
          onAdded={handleItemAdded}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className={`toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <div className="toast-content">
              <p className="toast-message">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Your Vault</h1>
            <p className={styles.subtitle}>
              {isUnlocked ? `${items.length} items · All encrypted` : 'Locked · Unlock to view'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setAddItemType('password'); setShowAddItem(true) }} disabled={!isUnlocked} id="add-password-btn">
              🔑 Password
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setAddItemType('api_key'); setShowAddItem(true) }} disabled={!isUnlocked} id="add-apikey-btn">
              ⚙️ API Key
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => { setAddItemType('note'); setShowAddItem(true) }} disabled={!isUnlocked} id="add-item-btn">
              + Add Item
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[
            { label: 'Total', value: stats.total, icon: '🗄️', color: 'var(--color-primary-light)' },
            { label: 'Passwords', value: stats.passwords, icon: '🔑', color: 'var(--color-password)' },
            { label: 'API Keys', value: stats.apiKeys, icon: '⚙️', color: 'var(--color-api-key)' },
            { label: 'Notes', value: stats.notes, icon: '📝', color: 'var(--color-note)' },
            { label: 'Favorites', value: stats.favorites, icon: '⭐', color: 'var(--color-warning)' },
          ].map((stat) => (
            <div key={stat.label} className={styles.statCard}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <div>
                <p className={styles.statValue} style={{ color: stat.color }}>{stat.value}</p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className={styles.controls}>
          <div className="form-input-icon-wrap" style={{ flex: 1 }}>
            <span className="input-icon">🔍</span>
            <input
              id="vault-search"
              type="text"
              className="form-input"
              placeholder="Search your vault…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.typeFilter}>
            {['all', 'password', 'api_key', 'note', 'card'].map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${filterType === type ? styles.filterBtnActive : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type === 'all' ? 'All' : type === 'api_key' ? 'API Keys' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.skeletonCard} skeleton`} />
            ))}
          </div>
        ) : !isUnlocked ? (
          <div className={styles.lockedState}>
            <div className={styles.lockedIcon}>🔒</div>
            <h2>Vault is Locked</h2>
            <p>Enter your master password to view your items</p>
            <button className="btn btn-primary" onClick={() => setShowUnlock(true)} id="unlock-vault-btn">
              Unlock Vault
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🗄️</div>
            <h2>{searchQuery ? 'No results found' : 'Your vault is empty'}</h2>
            <p>{searchQuery ? 'Try a different search term' : 'Add your first password, API key, or note'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={() => setShowAddItem(true)} id="add-first-item-btn">
                + Add First Item
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredItems.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                decryptedData={decryptedItems.get(item.id)}
                masterPassword={masterPassword!}
                onDeleted={handleItemDeleted}
                onUpdated={handleItemUpdated}
                onToast={showToast}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
