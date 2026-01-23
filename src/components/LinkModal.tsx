'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useApp } from '@/lib/context'
import { Task } from '@/types'

interface LinkModalProps {
  task: Task
  onClose: () => void
}

export function LinkModal({ task, onClose }: LinkModalProps) {
  const { updateTask, addToast } = useApp()
  const [link, setLink] = useState(task.link || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasExistingLink = !!task.link

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSubmit = async () => {
    const trimmedLink = link.trim()
    
    // Validate URL if provided
    if (trimmedLink) {
      try {
        new URL(trimmedLink)
      } catch {
        addToast('Invalid URL', 'error')
        inputRef.current?.focus()
        return
      }
    }

    setIsSubmitting(true)
    try {
      await updateTask(task.id, { link: trimmedLink || undefined })
      addToast(trimmedLink ? 'Link saved' : 'Link removed', 'success')
      onClose()
    } catch (error) {
      console.error('Error saving link:', error)
      addToast('Failed to save link', 'error')
      setIsSubmitting(false)
    }
  }

  const handleRemove = async () => {
    setIsSubmitting(true)
    try {
      await updateTask(task.id, { link: undefined })
      addToast('Link removed', 'success')
      onClose()
    } catch (error) {
      console.error('Error removing link:', error)
      addToast('Failed to remove link', 'error')
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 modal-backdrop" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-surface-secondary border border-border"
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
            {hasExistingLink ? 'EDIT LINK' : 'ADD LINK'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
            disabled={isSubmitting}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5l-10 10" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-text-muted mb-3 truncate">
            Task: {task.title}
          </p>
          <input
            ref={inputRef}
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSubmitting) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="https://jira.example.com/browse/TASK-123"
            className="input-field w-full px-4 py-3 text-base"
            disabled={isSubmitting}
          />
          <p className="text-xs text-text-muted mt-3">
            Paste a reference link (Jira, Figma, GitHub, etc.)
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
          <div className="text-xs text-text-muted">
            <span className="kbd">Enter</span> to save • <span className="kbd">Esc</span> to cancel
          </div>
          <div className="flex gap-2">
            {hasExistingLink && (
              <button
                onClick={handleRemove}
                className="btn-danger px-4 py-2"
                disabled={isSubmitting}
              >
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-secondary px-6 py-2"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn-primary px-6 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
