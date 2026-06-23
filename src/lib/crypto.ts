/**
 * Client-side AES-GCM encryption/decryption utility
 * Keys are derived from a Master Password using PBKDF2
 * NOTHING is ever sent to the server in plaintext
 */

const PBKDF2_ITERATIONS = 310_000
const SALT_LENGTH = 16
const IV_LENGTH = 12

/** Derive an AES-GCM CryptoKey from a master password + salt */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as Uint8Array<ArrayBuffer>,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypt a plaintext string with a master password.
 * Returns a Base64 string: salt(16) + iv(12) + ciphertext
 */
export async function encrypt(plaintext: string, masterPassword: string): Promise<string> {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(masterPassword, salt)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as Uint8Array<ArrayBuffer> },
    key,
    enc.encode(plaintext)
  )

  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypt a Base64 cipher string using the master password.
 * Returns the plaintext string, or throws on wrong password / tampered data.
 */
export async function decrypt(cipherBase64: string, masterPassword: string): Promise<string> {
  const dec = new TextDecoder()
  const combined = Uint8Array.from(atob(cipherBase64), (c) => c.charCodeAt(0))

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH)

  const key = await deriveKey(masterPassword, salt)

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as Uint8Array<ArrayBuffer> },
    key,
    ciphertext
  )

  return dec.decode(plaintext)
}

/**
 * Creates a verification hash to quickly check if the master password is correct
 * Stores it in the user profile so we can verify without decrypting all items
 */
export async function createMasterPasswordVerifier(masterPassword: string): Promise<string> {
  const SENTINEL = 'VAULT_MASTER_KEY_OK'
  return encrypt(SENTINEL, masterPassword)
}

export async function verifyMasterPassword(
  masterPassword: string,
  verifier: string
): Promise<boolean> {
  try {
    const result = await decrypt(verifier, masterPassword)
    return result === 'VAULT_MASTER_KEY_OK'
  } catch {
    return false
  }
}

/** Generate a cryptographically strong random password */
export function generatePassword(
  length = 24,
  opts: { upper?: boolean; lower?: boolean; numbers?: boolean; symbols?: boolean } = {}
): string {
  const { upper = true, lower = true, numbers = true, symbols = true } = opts
  let charset = ''
  if (upper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (lower) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (numbers) charset += '0123456789'
  if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz'

  const values = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(values)
    .map((v) => charset[v % charset.length])
    .join('')
}

/** Measure password strength: 0=weak, 1=fair, 2=good, 3=strong */
export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3; label: string } {
  let score = 0
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  const clampedScore = Math.min(3, Math.max(0, score - 1)) as 0 | 1 | 2 | 3
  const labels = ['Weak', 'Fair', 'Good', 'Strong']
  return { score: clampedScore, label: labels[clampedScore] }
}
