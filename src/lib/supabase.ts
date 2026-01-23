import { createBrowserClient } from '@supabase/ssr'

// Singleton instance for client-side use
let client: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  // Only create client on the browser
  if (typeof window === 'undefined') {
    throw new Error('getSupabase can only be called on the client')
  }
  
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      console.error('Missing Supabase environment variables')
      throw new Error('Missing Supabase configuration')
    }
    
    client = createBrowserClient(url, key)
  }
  return client
}
