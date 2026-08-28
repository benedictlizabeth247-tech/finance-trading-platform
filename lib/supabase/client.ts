import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Keep shared imports build-safe; login validates configuration before use.
  return createBrowserClient(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-anon-key',
    {
      // Secure cookies in production; not in dev, so localhost still works.
      cookieOptions: { secure: process.env.NODE_ENV === 'production' },
    },
  )
}
