# 🔐 Secure My-Vault App

A premium, highly secure web application for managing passwords and API keys. Built with Next.js 16 (App Router) and Supabase, featuring a zero-knowledge architecture where your my-vault items are encrypted entirely on the client side.

## ✨ Features

- **Zero-Knowledge Encryption:** Your data is encrypted and decrypted in your browser. The server only ever sees encrypted gibberish.
- **Dual Password System:** 
  - **Account Password:** Used to authenticate with the server (Supabase).
  - **Master Password:** Used locally to derive an AES-GCM encryption key via PBKDF2. This is never sent to the server.
- **Two-Factor Authentication (2FA):** Support for TOTP authenticator apps (Google Authenticator, Authy, etc.).
- **Production-Ready Auth Flow:** Complete with email verification (PKCE flow), session management, and route protection.
- **Premium UI:** Glassmorphic design, dark mode first, smooth micro-animations, built with pure CSS modules.

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Encryption:** Web Crypto API (AES-GCM 256-bit, PBKDF2)
- **Styling:** Vanilla CSS / CSS Modules
- **Language:** TypeScript

## 🔒 Security Architecture

1. **Authentication:** Supabase handles standard email/password authentication and TOTP 2FA.
2. **Key Derivation:** When you unlock your vault, your Master Password and a random salt are run through PBKDF2 (310,000 iterations) to generate a 256-bit AES-GCM key.
3. **Encryption:** When you save an item, it is encrypted in the browser using the derived key. The resulting ciphertext, along with the IV and salt, is encoded as a Base64 string and sent to the server.
4. **Decryption:** When you view an item, the Base64 string is fetched from the server and decrypted locally in your browser using your Master Password.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account (free tier works perfectly)

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Go to **Authentication > Providers > Email** and ensure settings are configured (you can disable "Confirm email" for local dev, but keep it on for production).
3. If using email confirmation, go to **Authentication > URL Configuration** and add your callback URLs:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Go to the **SQL Editor** in Supabase and run the contents of `supabase_schema.sql` to create the necessary tables (`profiles`, `vault_items`) and Row Level Security (RLS) policies.

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Set this to your production domain before deploying
# Leaves as localhost for local development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Run Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## 📦 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).
4. Deploy!

Ensure that your `NEXT_PUBLIC_SITE_URL` exactly matches your deployed domain (without a trailing slash) so that email confirmation redirects work correctly.

## 📝 License

MIT License
