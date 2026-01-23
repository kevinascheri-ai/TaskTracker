'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useApp } from '@/lib/context'
import { Task } from '@/types'

interface TaskModalProps {
  mode: 'add' | 'edit'
  task?: Task
  onClose: () => void
}

export function TaskModal({ mode, task, onClose }: TaskModalProps) {
  const { createTask, updateTask, addToast } = useApp()
  const [title, setTitle] = useState(task?.title || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isEdit = mode === 'edit'

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
    if (isEdit) {
      inputRef.current?.select()
    }
  }, [isEdit])

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      inputRef.current?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      if (isEdit && task) {
        await updateTask(task.id, { title: trimmedTitle })
        addToast('Task updated', 'success')
      } else {
        await createTask(trimmedTitle, 'p2') // Default priority, user sets after with 1-4 keys
        addToast('Task added', 'success')
      }
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      addToast('Failed to save task', 'error')
    } finally {
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
            {isEdit ? 'EDIT TASK' : 'NEW TASK'}
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
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSubmitting) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="What needs to get done?"
            className="input-field w-full px-4 py-3 text-base"
            disabled={isSubmitting}
          />
          
          {!isEdit && (
            <p className="text-xs text-text-muted mt-3">
              Use <span className="kbd">1</span>-<span className="kbd">4</span> after creating to set priority
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-surface">
          <div className="text-xs text-text-muted">
            <span className="kbd">Enter</span> to save • <span className="kbd">Esc</span> to cancel
          </div>
          <div className="flex gap-2">
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
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
