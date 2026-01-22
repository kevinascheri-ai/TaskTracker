'use client'

import { Task, getLinkLabel } from '@/types'
import { useApp } from '@/lib/context'

interface TaskItemProps {
  task: Task
  isSelected: boolean
  onSelect: () => void
  isReadOnly?: boolean
}

export function TaskItem({
  task,
  isSelected,
  onSelect,
  isReadOnly = false,
}: TaskItemProps) {
  const { toggleTaskDone, today } = useApp()

  const isDone = task.status === 'done'
  const isCarryover = task.dayCreated < today && !isDone
  const hasLink = !!task.link

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isReadOnly) {
      toggleTaskDone(task.id)
    }
  }

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.link) {
      window.open(task.link, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      data-task-id={task.id}
      className={`task-item group flex items-start gap-4 px-4 py-4 cursor-pointer ${
        isSelected ? 'selected' : ''
      } ${isDone ? 'done' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        disabled={isReadOnly}
        className={`checkbox flex items-center justify-center mt-0.5 ${isDone ? 'checked' : ''} ${
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
        {hasLink && (
          <button
            onClick={handleLinkClick}
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
              {getLinkLabel(task.link!)}
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
      </div>

      {/* Priority Badge */}
      {!isDone && (
        <span className={`priority-badge ${task.priority} flex-shrink-0 mt-0.5`}>
          {task.priority}
        </span>
      )}
    </div>
  )
}
