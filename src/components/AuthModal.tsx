'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'

type AuthMode = 'signin' | 'signup'

interface AuthModalProps {
  onClose?: () => void
  initialMode?: AuthMode
}

export function AuthModal({ onClose, initialMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, error, clearError, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  const handleSubmit = async () => {
    setLocalError(null)
    setSuccess(null)
    clearError()

    if (!email || !password) {
      setLocalError('Please fill in all fields')
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters')
        return
      }

      const result = await signUp(email, password)
      if (result.success) {
        setSuccess('Check your email to confirm your account!')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      }
    } else {
      const result = await signIn(email, password)
      if (result.success && onClose) {
        onClose()
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && onClose) {
      onClose()
    }
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const displayError = localError || error

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 modal-backdrop" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-surface-secondary border border-border"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 
            className="text-xl text-text-primary"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px' }}
          >
            {mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-text-muted hover:text-text-primary transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5l-10 10" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div 
              className="p-3 text-sm border-l-4"
              style={{ 
                background: 'var(--accent-muted)', 
                borderColor: 'var(--accent)',
                color: 'var(--accent)'
              }}
            >
              {success}
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div 
              className="p-3 text-sm border-l-4"
              style={{ 
                background: 'rgba(255, 59, 59, 0.1)', 
                borderColor: 'var(--priority-p0)',
                color: 'var(--priority-p0)'
              }}
            >
              {displayError}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="section-header block mb-2">Email</label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field w-full px-4 py-3"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="section-header block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full px-4 py-3"
              disabled={loading}
            />
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="section-header block mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full px-4 py-3"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface space-y-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading ? 'LOADING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>

          <p className="text-center text-sm text-text-muted">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup')
                    setLocalError(null)
                    setSuccess(null)
                    clearError()
                  }}
                  className="text-accent hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin')
                    setLocalError(null)
                    setSuccess(null)
                    clearError()
                  }}
                  className="text-accent hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
