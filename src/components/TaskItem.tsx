'use client'

import { useState, useRef } from 'react'
import { Task, getLinkLabel, Priority } from '@/types'
import { useApp } from '@/lib/context'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
  isReadOnly?: boolean
  onDragStart?: (e: React.DragEvent, task: Task) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, task: Task) => void
  onDragEnd?: () => void
}

export function TaskItem({
  task,
  isSelected,
  onSelect,
  isReadOnly = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TaskItemProps) {
  const { 
    toggleTaskDone, 
    updateTask,
    setEditingTask,
    setDeletingTask,
    setLinkingTask,
    today 
  } = useApp()

  const [showPriorityMenu, setShowPriorityMenu] = useState(false)
  const priorityRef = useRef<HTMLDivElement>(null)

  const isDone = task.status === 'done'
  const isCarryover = task.dayCreated < today && !isDone

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (!isReadOnly) {
      toggleTaskDone(task.id)
    }
  }

  const handleLinkClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (task.link) {
      window.open(task.link, '_blank', 'noopener,noreferrer')
    }
  }

  const handleEdit = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setEditingTask(task)
  }

  const handleDelete = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setDeletingTask(task)
  }

  const handleAddLink = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setLinkingTask(task)
  }

  const handlePriorityChange = (e: React.MouseEvent | React.TouchEvent, newPriority: Priority) => {
    e.stopPropagation()
    updateTask(task.id, { priority: newPriority })
    setShowPriorityMenu(false)
  }

  const handlePriorityClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isReadOnly && !isDone) {
      setShowPriorityMenu(!showPriorityMenu)
    }
  }

  // Close priority menu when clicking outside
  const handleBlur = () => {
    setTimeout(() => setShowPriorityMenu(false), 150)
  }

  const priorities: Priority[] = ['p0', 'p1', 'p2', 'p3']

  const handleDragStart = (e: React.DragEvent) => {
    if (isReadOnly || isDone) {
      e.preventDefault()
      return
    }
    onDragStart?.(e, task)
  }

  return (
    <div
      data-task-id={task.id}
      className={`task-item group flex items-start gap-3 px-4 py-4 cursor-pointer ${
        isSelected ? 'selected' : ''
      } ${isDone ? 'done' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      draggable={!isReadOnly && !isDone}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver?.(e)
      }}
      onDrop={(e) => onDrop?.(e, task)}
      onDragEnd={onDragEnd}
    >
      {/* Checkbox - larger touch target */}
      <button
        onClick={handleToggle}
        onTouchEnd={handleToggle}
        disabled={isReadOnly}
        className={`checkbox flex items-center justify-center mt-0.5 min-w-[24px] min-h-[24px] ${isDone ? 'checked' : ''} ${
          isReadOnly ? 'cursor-default opacity-50' : ''
        }`}
        aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isDone && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#000" strokeWidth="2.5">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span
            className={`text-base ${
              isDone ? 'line-through text-text-muted' : 'text-text-primary'
            }`}
          >
            {task.title}
          </span>
          {isCarryover && (
            <span 
              className="text-[10px] px-2 py-0.5 uppercase tracking-wider font-bold flex-shrink-0"
              style={{
                background: 'var(--accent-secondary-muted)',
                color: 'var(--accent-secondary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              Carried
            </span>
          )}
        </div>
        
        {/* Link - shown below task title */}
        {task.link && (
          <button
            onClick={handleLinkClick}
            onTouchEnd={handleLinkClick}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover transition-colors group/link"
          >
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className="flex-shrink-0"
            >
              <path d="M5 7l2-2M4.5 8.5l-1 1a1.5 1.5 0 01-2.12-2.12l1-1M7.5 3.5l1-1a1.5 1.5 0 012.12 2.12l-1 1" />
            </svg>
            <span className="group-hover/link:underline">
              {getLinkLabel(task.link)}
            </span>
            <svg 
              width="10" 
              height="10" 
              viewBox="0 0 10 10" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              className="opacity-50 flex-shrink-0"
            >
              <path d="M3 1h6v6M9 1L4 6" />
            </svg>
          </button>
        )}

        {/* Touch Action Bar - shown when selected on mobile */}
        {isSelected && !isReadOnly && (
          <div className="flex items-center gap-2 mt-3 md:hidden">
            <button
              onClick={handleEdit}
              className="touch-action-btn"
              aria-label="Edit task"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 2l2 2-8 8H2v-2l8-8z" />
              </svg>
            </button>
            <button
              onClick={handleAddLink}
              className="touch-action-btn"
              aria-label="Add link"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8l2-2M5.5 9.5l-1 1a2 2 0 01-2.83-2.83l1-1M8.5 4.5l1-1a2 2 0 012.83 2.83l-1 1" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="touch-action-btn touch-action-btn-danger"
              aria-label="Delete task"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 4h8M5 4V3h4v1M6 6v4M8 6v4M4 4l.5 7h5l.5-7" />
              </svg>
            </button>
            {!isDone && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={(e) => handlePriorityChange(e, p)}
                    className={`priority-touch-btn ${p} ${task.priority === p ? 'active' : ''}`}
                    aria-label={`Set priority ${p}`}
                  >
                    {p.charAt(1)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drag Handle - visible on hover (desktop) */}
      {!isDone && !isReadOnly && (
        <div className="hidden md:flex items-center opacity-0 group-hover:opacity-50 transition-opacity cursor-grab active:cursor-grabbing flex-shrink-0 mt-1">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" className="text-text-muted">
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="9" cy="13" r="1.5" />
          </svg>
        </div>
      )}

      {/* Priority Badge - clickable */}
      {!isDone && (
        <div className="relative flex-shrink-0 mt-0.5" ref={priorityRef} onBlur={handleBlur}>
          <button
            onClick={handlePriorityClick}
            className={`priority-badge ${task.priority} ${!isReadOnly ? 'cursor-pointer hover:opacity-80' : ''}`}
            disabled={isReadOnly}
            aria-label={`Priority ${task.priority}, click to change`}
          >
            {task.priority}
          </button>
          
          {/* Priority dropdown menu */}
          {showPriorityMenu && !isReadOnly && (
            <div 
              className="absolute right-0 top-full mt-1 bg-surface-secondary border border-border shadow-lg z-50"
              style={{ minWidth: '60px' }}
            >
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={(e) => handlePriorityChange(e, p)}
                  className={`w-full px-3 py-2 text-xs uppercase tracking-wider text-left hover:bg-surface transition-colors ${
                    task.priority === p ? 'bg-surface text-accent' : 'text-text-primary'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
