'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { User, AuthError, SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabaseRef = useRef<SupabaseClient | null>(null)

  // Initialize Supabase client on mount (client-side only)
  useEffect(() => {
    try {
      supabaseRef.current = getSupabase()
    } catch (err) {
      console.error('Failed to initialize Supabase:', err)
      setLoading(false)
      return
    }

    const supabase = supabaseRef.current

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (err) {
        console.error('Error getting session:', err)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = supabaseRef.current
    if (!supabase) return { success: false, error: 'Not initialized' }
    
    setError(null)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Sign up failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = supabaseRef.current
    if (!supabase) return { success: false, error: 'Not initialized' }
    
    setError(null)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      return { success: true, data }
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Sign in failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async () => {
    const supabase = supabaseRef.current
    if (!supabase) return { success: false, error: 'Not initialized' }
    
    setError(null)
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err instanceof AuthError ? err.message : 'Sign out failed'
      setError(message)
      return { success: false, error: message }
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated: !!user,
  }
}
