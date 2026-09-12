import Link from 'next/link'
import styles from './page.module.css'

export const metadata = {
  title: 'My-Vault — Zero-Knowledge Password & Secret Manager',
  description: 'Store passwords, API keys, and sensitive notes with client-side AES-256-GCM encryption. Your data never leaves your browser unencrypted.',
  keywords: ['password manager', 'zero-knowledge', 'encrypted vault', 'API key manager', 'secure notes', '2FA'],
  robots: 'index, follow',
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🔐</span>
            <span className={styles.logoText}>My-Vault</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>
              Log in
            </Link>
            <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroBadge}>
          <span className={styles.badgeDot} />
          Zero-knowledge encryption
        </div>
        <h1 className={styles.heroTitle}>
          Your secrets,<br />
          <span className={styles.heroHighlight}>truly yours.</span>
        </h1>
        <p className={styles.heroSub}>
          A premium vault for passwords, API keys, and sensitive notes — encrypted
          in your browser before anything ever touches the server.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            Start for free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5-5-5-5"/></svg>
          </Link>
          <Link href="#features" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLg}`}>
            See how it works
          </Link>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.vaultPreview}>
            <div className={styles.vaultPreviewBar}>
              <span className={styles.dot} style={{ background: '#ef4444' }} />
              <span className={styles.dot} style={{ background: '#f59e0b' }} />
              <span className={styles.dot} style={{ background: '#10b981' }} />
              <span className={styles.vaultPreviewTitle}>my-vault</span>
            </div>
            <div className={styles.vaultPreviewContent}>
              <div className={styles.previewItem}>
                <div className={styles.previewIcon} style={{ color: '#818cf8' }}>🔑</div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewLabel}>GitHub Token</div>
                  <div className={styles.previewValue}>ghp_••••••••••••••••</div>
                </div>
                <span className={`${styles.badge} ${styles.badgeApi}`}>API Key</span>
              </div>
              <div className={styles.previewItem}>
                <div className={styles.previewIcon} style={{ color: '#34d399' }}>🔐</div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewLabel}>AWS Credentials</div>
                  <div className={styles.previewValue}>AKIA••••••••••••••••</div>
                </div>
                <span className={`${styles.badge} ${styles.badgePassword}`}>Password</span>
              </div>
              <div className={styles.previewItem}>
                <div className={styles.previewIcon} style={{ color: '#fb923c' }}>📝</div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewLabel}>Recovery Codes</div>
                  <div className={styles.previewValue}>••••••••••••••••••••</div>
                </div>
                <span className={`${styles.badge} ${styles.badgeNote}`}>Note</span>
              </div>
              <div className={styles.previewItem}>
                <div className={styles.previewIcon} style={{ color: '#f472b6' }}>💳</div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewLabel}>Visa •••• 4242</div>
                  <div className={styles.previewValue}>•••• •••• •••• ••••</div>
                </div>
                <span className={`${styles.badge} ${styles.badgeCard}`}>Card</span>
              </div>
            </div>
            <div className={styles.vaultPreviewFooter}>
              <span className={styles.previewLockIcon}>🔒</span>
              <span>AES-256-GCM encrypted</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>Features</span>
          <h2 className={styles.sectionTitle}>
            Everything you need,<br />nothing you don&apos;t.
          </h2>
          <p className={styles.sectionSub}>
            Built for people who care about security without the complexity.
          </p>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🛡️</div>
              <h3>Zero-Knowledge</h3>
              <p>Data is encrypted and decrypted entirely in your browser. The server only ever sees ciphertext.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔑</div>
              <h3>Dual Password System</h3>
              <p>An account password for auth and a master password for encryption. Your master key never leaves your device.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>4 Item Types</h3>
              <p>Passwords, API keys, secure notes, and cards — each with tailored fields and quick-copy.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎲</div>
              <h3>Password Generator</h3>
              <p>Cryptographically random passwords with a live strength meter. Never reuse a weak password again.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📋</div>
              <h3>Auto-Clear Clipboard</h3>
              <p>Copied secrets are wiped from your clipboard after 30 seconds. No accidental leaks.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3>Two-Factor Auth</h3>
              <p>TOTP-based 2FA with QR code enrollment. Works with Google Authenticator, Authy, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY ── */}
      <section className={styles.security}>
        <div className={styles.sectionInner}>
          <span className={styles.sectionLabel}>Security</span>
          <h2 className={styles.sectionTitle}>
            Military-grade encryption,<br />consumer-grade simplicity.
          </h2>

          <div className={styles.securitySteps}>
            <div className={styles.securityStep}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Sign up</h4>
                <p>Create an account with email and password. Supabase handles authentication.</p>
              </div>
            </div>
            <div className={styles.securityStep}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Set master password</h4>
                <p>Your master password is run through PBKDF2 (310K iterations) to derive your AES-256 key — entirely in-browser.</p>
              </div>
            </div>
            <div className={styles.securityStep}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Store &amp; sync</h4>
                <p>Items are encrypted client-side before syncing. Only ciphertext reaches the server. We can&apos;t read your data — even if we wanted to.</p>
              </div>
            </div>
          </div>

          <div className={styles.securityBadges}>
            <div className={styles.secBadge}>
              <span className={styles.secBadgeIcon}>🔐</span>
              <div>
                <strong>AES-256-GCM</strong>
                <span>Industry-standard encryption</span>
              </div>
            </div>
            <div className={styles.secBadge}>
              <span className={styles.secBadgeIcon}>🧮</span>
              <div>
                <strong>PBKDF2 310K</strong>
                <span>Key derivation iterations</span>
              </div>
            </div>
            <div className={styles.secBadge}>
              <span className={styles.secBadgeIcon}>🗄️</span>
              <div>
                <strong>Row-Level Security</strong>
                <span>Postgres RLS policies</span>
              </div>
            </div>
            <div className={styles.secBadge}>
              <span className={styles.secBadgeIcon}>🌐</span>
              <div>
                <strong>Client-Side Only</strong>
                <span>Encryption never leaves your device</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <h2>Ready to secure your digital life?</h2>
          <p>Start for free. No credit card required. Your data stays yours — always.</p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
              Create your vault
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5-5-5-5"/></svg>
            </Link>
            <Link href="/login" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLg}`}>
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logoIcon}>🔐</span>
            <span className={styles.logoText}>My-Vault</span>
          </div>
          <p className={styles.footerCopy}>
            Built with care. Your secrets never leave your device unencrypted.
          </p>
          <div className={styles.footerLinks}>
            <Link href="/login">Log in</Link>
            <Link href="/register">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
