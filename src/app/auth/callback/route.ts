import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Auth callback handler — the PKCE exchange endpoint.
 *
 * Supabase sends users here after they click the confirmation link in their
 * email. The URL looks like:
 *   /auth/callback?code=<one-time-code>&next=/dashboard
 *
 * We exchange the code for a real session, then redirect to `next`.
 * This is required for production email confirmation to work.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // `next` lets us redirect to a specific page after confirmation
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure the profile row exists — it may not if the user registered
      // but never completed the confirmation flow before.
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name ?? '',
          master_password_verifier: null,
          totp_enabled: false,
        })
      }

      // Redirect to the app — session cookie is now set
      return NextResponse.redirect(`${origin}${next}`)
    }

    // Code exchange failed (expired/already used)
    return NextResponse.redirect(
      `${origin}/auth/error?message=The+confirmation+link+has+expired+or+already+been+used.+Please+request+a+new+one.`
    )
  }

  // No code param — something is wrong
  return NextResponse.redirect(
    `${origin}/auth/error?message=Invalid+confirmation+link.`
  )
}
