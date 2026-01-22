'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  isDucksMode?: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRef.current.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', isDucksMode = false) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    
    setToasts((prev) => [...prev, { id, message, type, isDucksMode }])

    // Auto-dismiss after 2.5 seconds
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
      timeoutRef.current.delete(id)
    }, 2500)

    timeoutRef.current.set(id, timeout)
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timeout = timeoutRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeoutRef.current.delete(id)
    }
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
  }
}

export type ToastType = ReturnType<typeof useToast>
