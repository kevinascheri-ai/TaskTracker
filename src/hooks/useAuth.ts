'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { getSupabase } from '@/lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = getSupabase()

  // Check current session on mount
  useEffect(() => {
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
  }, [supabase])

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
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
  }, [supabase])

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
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
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
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
  }, [supabase])

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
