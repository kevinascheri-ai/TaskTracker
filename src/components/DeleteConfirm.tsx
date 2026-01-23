'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { Task } from '@/types'
import { useApp } from '@/lib/context'

interface DeleteConfirmProps {
  task: Task
  onClose: () => void
}

export function DeleteConfirm({ task, onClose }: DeleteConfirmProps) {
  const { deleteTask, addToast } = useApp()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
      addToast('Task deleted', 'info')
      onClose()
    } catch (error) {
      console.error('Error deleting task:', error)
      addToast('Failed to delete task', 'error')
      setIsDeleting(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  // Focus trap
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (isDeleting) return
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isDeleting])

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
        className="relative w-full max-w-sm bg-surface-secondary border border-border p-6"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 
          className="text-lg text-text-primary mb-2"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px' }}
        >
          DELETE TASK?
        </h2>
        
        <p className="text-text-secondary text-sm mb-6">
          "{task.title}"
        </p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 py-2"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger flex-1 py-2"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>

        <p className="text-xs text-text-muted mt-4 text-center">
          <span className="kbd">Enter</span> to confirm • <span className="kbd">Esc</span> to cancel
        </p>
      </div>
    </div>
  )
}
