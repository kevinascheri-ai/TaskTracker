'use client'

import { useApp } from '@/lib/context'

export function HotkeyBar() {
  const { isReadOnly, selectedTaskId, todoTasks, doneTasks } = useApp()

  // Find selected task to check if it has a link
  const allTasks = [...todoTasks, ...doneTasks]
  const selectedTask = selectedTaskId ? allTasks.find(t => t.id === selectedTaskId) : null
  const hasLink = selectedTask?.link

  if (isReadOnly) {
    return (
      <div 
        className="flex-shrink-0 hotkey-bar px-4 py-3"
        style={{ zIndex: 20 }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-text-muted">
          <span className="flex items-center gap-2">
            <span className="kbd">J</span>
            <span className="kbd">K</span>
            <span className="uppercase tracking-wider">Navigate</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="kbd">←</span>
            <span className="kbd">→</span>
            <span className="uppercase tracking-wider">Change Day</span>
          </span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex-shrink-0 hotkey-bar px-4 py-3"
      style={{ zIndex: 20 }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="kbd kbd-accent">N</span>
            <span className="uppercase tracking-wider">New</span>
          </span>
          {selectedTaskId && (
            <>
              <span className="flex items-center gap-2">
                <span className="kbd">E</span>
                <span className="uppercase tracking-wider">Edit</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="kbd">X</span>
                <span className="uppercase tracking-wider">Done</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="kbd">L</span>
                <span className="uppercase tracking-wider">Link</span>
              </span>
              {hasLink && (
                <span className="flex items-center gap-2">
                  <span className="kbd">O</span>
                  <span className="uppercase tracking-wider">Open</span>
                </span>
              )}
              <span className="flex items-center gap-2">
                <span className="kbd">D</span>
                <span className="uppercase tracking-wider">Delete</span>
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="kbd">J</span>
            <span className="kbd">K</span>
            <span className="uppercase tracking-wider">Nav</span>
          </span>
        </div>
      </div>
    </div>
  )
}
