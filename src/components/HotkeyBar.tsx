'use client'

import { useApp } from '@/lib/context'

export function HotkeyBar() {
  const { 
    isReadOnly, 
    selectedTaskId, 
    todoTasks, 
    doneTasks,
    setShowAddModal,
    setEditingTask,
    setDeletingTask,
    setLinkingTask,
    toggleTaskDone,
  } = useApp()

  // Find selected task to check if it has a link
  const allTasks = [...todoTasks, ...doneTasks]
  const selectedTask = selectedTaskId ? allTasks.find(t => t.id === selectedTaskId) : null
  const hasLink = selectedTask?.link

  const handleOpenLink = () => {
    if (selectedTask?.link) {
      window.open(selectedTask.link, '_blank', 'noopener,noreferrer')
    }
  }

  if (isReadOnly) {
    return (
      <div 
        className="flex-shrink-0 hotkey-bar px-4 py-3"
        style={{ zIndex: 20 }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-6 text-xs text-text-muted">
          {/* Desktop: show keyboard hints */}
          <span className="hidden md:flex items-center gap-2">
            <span className="kbd">J</span>
            <span className="kbd">K</span>
            <span className="uppercase tracking-wider">Navigate</span>
          </span>
          <span className="hidden md:flex items-center gap-2">
            <span className="kbd">←</span>
            <span className="kbd">→</span>
            <span className="uppercase tracking-wider">Change Day</span>
          </span>
          {/* Mobile: show swipe hint */}
          <span className="md:hidden uppercase tracking-wider text-text-muted">
            Tap arrows to change day
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
        {/* Left side - actions */}
        <div className="flex items-center gap-4">
          {/* New Task Button - always visible, tappable */}
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 hover:text-accent transition-colors touch-target"
          >
            <span className="kbd kbd-accent hidden md:inline">N</span>
            <span className="md:hidden text-accent text-lg leading-none">+</span>
            <span className="uppercase tracking-wider">New</span>
          </button>

          {/* Desktop keyboard hints for selected task */}
          {selectedTaskId && (
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => selectedTask && setEditingTask(selectedTask)}
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <span className="kbd">E</span>
                <span className="uppercase tracking-wider">Edit</span>
              </button>
              <button 
                onClick={() => selectedTask && toggleTaskDone(selectedTask.id)}
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <span className="kbd">X</span>
                <span className="uppercase tracking-wider">Done</span>
              </button>
              <button 
                onClick={() => selectedTask && setLinkingTask(selectedTask)}
                className="flex items-center gap-2 hover:text-accent transition-colors"
              >
                <span className="kbd">L</span>
                <span className="uppercase tracking-wider">Link</span>
              </button>
              {hasLink && (
                <button 
                  onClick={handleOpenLink}
                  className="flex items-center gap-2 hover:text-accent transition-colors"
                >
                  <span className="kbd">O</span>
                  <span className="uppercase tracking-wider">Open</span>
                </button>
              )}
              <button 
                onClick={() => selectedTask && setDeletingTask(selectedTask)}
                className="flex items-center gap-2 hover:text-priority-p0 transition-colors"
              >
                <span className="kbd">D</span>
                <span className="uppercase tracking-wider">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Right side - nav hints (desktop only) */}
        <div className="hidden md:flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="kbd">J</span>
            <span className="kbd">K</span>
            <span className="uppercase tracking-wider">Nav</span>
          </span>
        </div>

        {/* Mobile hint when no task selected */}
        {!selectedTaskId && (
          <span className="md:hidden uppercase tracking-wider text-[10px]">
            Tap task to select
          </span>
        )}
      </div>
    </div>
  )
}
