'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = await createClient()

  // Build the absolute callback URL.
  // NEXT_PUBLIC_SITE_URL must be set to your production domain (e.g. https://vault.example.com).
  // Falls back to localhost for local development.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create profile row
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: fullName,
      master_password_verifier: null,
      totp_enabled: false,
    })
  }

  return { success: true, user: data.user }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data.user, session: data.session }
}

export async function resendVerification(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

export async function saveMasterPasswordVerifier(userId: string, verifier: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ master_password_verifier: verifier })
    .eq('id', userId)

  if (error) return { error: error.message }
  return { success: true }
}

/** Enroll TOTP: returns the QR code URI and secret for display */
export async function enrollTotp() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'My-Vault App',
  })

  if (error) return { error: error.message }
  return {
    id: data.id,
    totpUri: data.totp.uri,
    secret: data.totp.secret,
  }
}

/** Challenge the TOTP factor to start the verification flow */
export async function challengeTotp(factorId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.challenge({ factorId })
  if (error) return { error: error.message }
  return { challengeId: data.id }
}

/** Verify the TOTP code to complete enrollment or login */
export async function verifyTotp(factorId: string, challengeId: string, code: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code,
  })

  if (error) return { error: error.message }
  return { success: true, session: data }
}

/** Get MFA factors for current user */
export async function getMfaFactors() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.mfa.listFactors()
  if (error) return { factors: [] }
  return { factors: data.totp }
}

/** Unenroll TOTP */
export async function unenrollTotp(factorId: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) return { error: error.message }

  await supabase.from('profiles').update({ totp_enabled: false }).eq('id', (await supabase.auth.getUser()).data.user?.id)
  return { success: true }
}
