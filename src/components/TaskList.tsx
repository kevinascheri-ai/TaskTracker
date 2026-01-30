'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { TaskItem } from './TaskItem'
import { useApp } from '@/lib/context'
import { useKeyboard } from '@/hooks/useKeyboard'
import { Task } from '@/types'

export function TaskList() {
  const {
    todoTasks,
    doneTasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    toggleTaskDone,
    reorderTask,
    reorderTaskToPosition,
    isReadOnly,
    currentTasks,
    setShowAddModal,
    setEditingTask,
    setDeletingTask,
    setLinkingTask,
  } = useApp()

  const listRef = useRef<HTMLDivElement>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
    // Add a slight delay to allow the drag image to form
    requestAnimationFrame(() => {
      const element = e.target as HTMLElement
      element.style.opacity = '0.5'
    })
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, taskId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedTask && draggedTask.id !== taskId) {
      setDragOverTaskId(taskId)
    }
  }, [draggedTask])

  // Handle drop
  const handleDrop = useCallback(async (e: React.DragEvent, targetTask: Task) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.id === targetTask.id) {
      setDraggedTask(null)
      setDragOverTaskId(null)
      return
    }

    // Only allow reordering within todo tasks
    if (targetTask.status === 'done' || draggedTask.status === 'done') {
      setDraggedTask(null)
      setDragOverTaskId(null)
      return
    }

    // Calculate new order
    const currentIds = todoTasks.map(t => t.id)
    const draggedIndex = currentIds.indexOf(draggedTask.id)
    const targetIndex = currentIds.indexOf(targetTask.id)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTask(null)
      setDragOverTaskId(null)
      return
    }

    // Reorder the array
    const newIds = [...currentIds]
    newIds.splice(draggedIndex, 1)
    newIds.splice(targetIndex, 0, draggedTask.id)

    await reorderTaskToPosition(draggedTask.id, targetIndex, newIds)
    
    setDraggedTask(null)
    setDragOverTaskId(null)
  }, [draggedTask, todoTasks, reorderTaskToPosition])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedTask(null)
    setDragOverTaskId(null)
  }, [])

  // Scroll selected task into view when selection changes
  useEffect(() => {
    if (selectedTaskId && listRef.current) {
      const selectedElement = listRef.current.querySelector(
        `[data-task-id="${selectedTaskId}"]`
      )
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }
  }, [selectedTaskId])

  // Keyboard navigation - pass visually-ordered lists
  useKeyboard({
    todoTasks,
    doneTasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    toggleTaskDone,
    reorderTask,
    onAddTask: () => setShowAddModal(true),
    onEditTask: (task) => setEditingTask(task),
    onDeleteTask: (task) => setDeletingTask(task),
    onLinkTask: (task) => setLinkingTask(task),
    onOpenLink: (task) => {
      if (task.link) {
        window.open(task.link, '_blank', 'noopener,noreferrer')
      }
    },
    isReadOnly,
  })

  // Empty state
  if (currentTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 empty-state overflow-hidden">
        <div 
          className="text-6xl mb-6 opacity-30"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          //
        </div>
        <p 
          className="text-text-muted text-center uppercase tracking-widest text-sm"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {isReadOnly
            ? 'No tasks completed this day'
            : 'No tasks yet'
          }
        </p>
        {!isReadOnly && (
          <p className="text-text-muted mt-4 flex items-center gap-2">
            Press <span className="kbd kbd-accent">N</span> to add a task
          </p>
        )}
      </div>
    )
  }

  return (
    <div 
      className="flex-1 overflow-y-auto overflow-x-hidden" 
      ref={listRef}
      style={{ position: 'relative', zIndex: 10 }}
    >
      <div className="max-w-2xl mx-auto py-4">
        {/* Todo Tasks */}
        {todoTasks.length > 0 && (
          <section>
            {!isReadOnly && (
              <div className="px-4 py-3 flex items-center gap-3">
                <div 
                  className="h-px flex-1"
                  style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }}
                />
                <h2 className="section-header section-header-accent">
                  IN PROGRESS ({todoTasks.length})
                </h2>
                <div 
                  className="h-px flex-1"
                  style={{ background: 'linear-gradient(270deg, var(--accent), transparent)' }}
                />
              </div>
            )}
            <div>
              {todoTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => setSelectedTaskId(task.id)}
                  isReadOnly={isReadOnly}
                  onDragStart={handleDragStart}
                  onDragOver={(e) => handleDragOver(e, task.id)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Tasks */}
        {doneTasks.length > 0 && (
          <section className="mt-6">
            <div className="px-4 py-3 flex items-center gap-3">
              <div 
                className="h-px flex-1"
                style={{ background: 'linear-gradient(90deg, var(--text-muted), transparent)' }}
              />
              <h2 className="section-header">
                COMPLETED ({doneTasks.length})
              </h2>
              <div 
                className="h-px flex-1"
                style={{ background: 'linear-gradient(270deg, var(--text-muted), transparent)' }}
              />
            </div>
            
            <div className="opacity-50">
              {doneTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={() => setSelectedTaskId(task.id)}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
