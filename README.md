<div align="center">
  <h1>🔐 My-Vault</h1>
  <p><strong>A premium, zero-knowledge password manager and secret vault.</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Security-AES--256--GCM-red?style=flat-square" alt="Security" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License" />
  </p>
</div>

<br />

Store passwords, API keys, secure notes, and card details — all encrypted in your browser before anything ever touches the server. Built with **Next.js 16** (App Router), **React 19**, and **Supabase**, featuring a client-side AES-256-GCM encryption architecture powered by the Web Crypto API.

## 📑 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Security Architecture](#-security-architecture)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Zero-Knowledge Encryption** — Data is encrypted and decrypted entirely in your browser using the Web Crypto API. The server only ever sees AES-GCM ciphertext.
- **Dual Password System**
  - **Account password** — authenticates with Supabase (email + password).
  - **Master password** — derived locally into your encryption key. It never leaves your device.
- **4 Item Types** — Passwords, API keys, secure notes, and cards, each with tailored fields.
- **Password Generator & Strength Meter** — Cryptographically random passwords with a live strength indicator.
- **Vault Management** — Search, filter by type, tags, favorites, reveal/hide secrets, one-click copy, and inline editing.
- **Clipboard Auto-Clear** — Copied secrets are automatically wiped from the clipboard after 30 seconds for security.
- **TOTP Two-Factor Authentication** — Enroll, verify, and disable 2FA via authenticator apps (Google Authenticator, Authy, etc.) with QR code display.
- **Production-Ready Auth Flow** — Email verification (PKCE), session refresh, and route protection.
- **Row-Level Security** — Supabase RLS policies guarantee users can only ever access their own data.
- **Glassmorphic Dark UI** — Polished, dark-mode-first interface built with pure CSS Modules.

---

## 🛠️ Technology Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| **Language** | TypeScript |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| **Encryption** | Web Crypto API — AES-256-GCM, PBKDF2-SHA256 (310,000 iterations) |
| **2FA** | TOTP via [otpauth](https://www.npmjs.com/package/otpauth) + [qrcode](https://www.npmjs.com/package/qrcode) |
| **Styling** | CSS Modules (no UI framework) |

---

## 🔒 Security Architecture

1. **Authentication** — Supabase handles email/password sign-in, PKCE email verification, sessions, and TOTP 2FA.
2. **Key Derivation** — Your master password and a random 16-byte salt are run through PBKDF2 (310,000 iterations, SHA-256) to produce a 256-bit AES-GCM key. This happens securely in the browser.
3. **Encryption** — On save, the item payload is encrypted client-side. The Base64 blob `salt(16) + iv(12) + ciphertext` is the only thing sent to the server (`src/lib/crypto.ts:39`).
4. **Master Password Verification** — An encrypted sentinel value (`VAULT_MASTER_KEY_OK`) is stored in your profile so the app can confirm your master password without decrypting every item (`src/lib/crypto.ts:86`).
5. **Decryption** — Items are fetched as encrypted blobs and decrypted locally in your browser using your master password.
6. **Master Password Lifecycle** — Held in a `useRef` (not React state) so it isn't exposed through DevTools, and it never persists beyond the current session (`src/lib/masterKeyContext.tsx`).

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your application)*

| Dashboard view | Vault Item detail |
| :---: | :---: |
| <img src="https://via.placeholder.com/600x350/111111/FFFFFF?text=Dashboard+View" alt="Dashboard" /> | <img src="https://via.placeholder.com/600x350/111111/FFFFFF?text=Item+Detail" alt="Item Detail" /> |

---

## 🗂️ Project Structure

```text
src/
├── proxy.ts                       # Session refresh + route protection (Next.js proxy)
├── app/
│   ├── (auth)/                    # Public auth routes
│   │   ├── login/                 #   Sign in (with 2FA redirect handling)
│   │   ├── register/              #   Sign up
│   │   └── verify-2fa/            #   TOTP code entry
│   ├── (vault)/                   # Protected app routes (sidebar layout)
│   │   ├── dashboard/             #   Main vault grid + modals + item cards
│   │   └── settings/              #   Account info, 2FA, encryption details
│   ├── auth/
│   │   ├── callback/route.ts      #   OAuth/PKCE callback handler
│   │   └── error/                 #   Auth error page
│   └── actions/                   # Server Actions
│       ├── auth.ts                #   Signup/login/2FA/profile actions
│       └── vault.ts               #   Vault item CRUD
└── lib/
    ├── crypto.ts                  # Client-side AES-GCM + PBKDF2 + password utils
    ├── masterKeyContext.tsx       # Master password context (unlock/lock)
    └── supabase/                  # Client, server, and proxy session clients
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- A [Supabase](https://supabase.com/) project (free tier is sufficient)

### 1. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Authentication → Providers → Email** and configure the provider (disable *Confirm email* for local dev; keep it enabled for production).
3. If email confirmation is enabled, add your redirect URLs under **Authentication → URL Configuration**:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Open the **SQL Editor** and run the contents of [`supabase_schema.sql`](./supabase_schema.sql). This creates the `profiles` and `vault_items` tables, indexes, `updated_at` triggers, RLS policies, and an auto-profile-on-signup trigger.

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Note:** `NEXT_PUBLIC_SITE_URL` must match your deployed domain (no trailing slash) for email confirmation redirects to work.

### 3. Run Locally

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first sign-in, you'll be prompted to create a master password — this unlocks your vault.

---

## 📦 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the three environment variables defined above.
4. Deploy!

*Make sure `NEXT_PUBLIC_SITE_URL` exactly matches your Vercel domain.*

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint for code quality |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
