'use client'

import { useEffect, useCallback } from 'react'
import { Task, Priority } from '@/types'

interface UseKeyboardProps {
  // Pass in the visually-ordered task lists for correct navigation
  todoTasks: Task[]
  doneTasks: Task[]
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>
  toggleTaskDone: (id: string) => Promise<Task | null>
  reorderTask: (id: string, direction: 'up' | 'down') => Promise<boolean>
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onLinkTask: (task: Task) => void
  onOpenLink: (task: Task) => void
  enabled?: boolean
  isReadOnly?: boolean
}

// Map number keys to priorities
const PRIORITY_MAP: Record<string, Priority> = {
  '1': 'p0',
  '2': 'p1',
  '3': 'p2',
  '4': 'p3',
}

export function useKeyboard({
  todoTasks,
  doneTasks,
  selectedTaskId,
  setSelectedTaskId,
  updateTask,
  toggleTaskDone,
  reorderTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onLinkTask,
  onOpenLink,
  enabled = true,
  isReadOnly = false,
}: UseKeyboardProps) {
  // Get task IDs in visual order: todo tasks first (in their display order), then done tasks
  const getTaskIds = useCallback(() => {
    return [...todoTasks, ...doneTasks].map((t) => t.id)
  }, [todoTasks, doneTasks])

  // Get all tasks for lookup
  const getAllTasks = useCallback(() => {
    return [...todoTasks, ...doneTasks]
  }, [todoTasks, doneTasks])

  // Navigate selection
  const navigateSelection = useCallback((direction: 'up' | 'down') => {
    const ids = getTaskIds()
    if (ids.length === 0) return

    if (!selectedTaskId) {
      // No selection - select first or last based on direction
      setSelectedTaskId(direction === 'down' ? ids[0] : ids[ids.length - 1])
      return
    }

    const currentIndex = ids.indexOf(selectedTaskId)
    if (currentIndex === -1) {
      // Selection not found - select first
      setSelectedTaskId(ids[0])
      return
    }

    // Move to next/previous
    const nextIndex = direction === 'down' 
      ? Math.min(currentIndex + 1, ids.length - 1)
      : Math.max(currentIndex - 1, 0)

    setSelectedTaskId(ids[nextIndex])
  }, [getTaskIds, selectedTaskId, setSelectedTaskId])

  // Handle key events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return

    // Check if we're in an input/textarea or modal
    const target = e.target as HTMLElement
    const isEditing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

    // If editing, don't handle any shortcuts
    if (isEditing) {
      return
    }

    // Navigation: j/k or arrow keys (always available)
    if (e.key === 'j' || e.key === 'ArrowDown') {
      e.preventDefault()
      navigateSelection('down')
      return
    }

    if (e.key === 'k' || e.key === 'ArrowUp') {
      e.preventDefault()
      navigateSelection('up')
      return
    }

    // Add task: n or a (only in today view)
    if ((e.key === 'n' || e.key === 'a') && !isReadOnly) {
      e.preventDefault()
      onAddTask()
      return
    }

    // Read-only mode: no more mutations allowed below this point
    if (isReadOnly) return

    // Reorder: Cmd+↑ / Cmd+↓
    if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault()
      if (selectedTaskId) {
        reorderTask(selectedTaskId, e.key === 'ArrowUp' ? 'up' : 'down')
      }
      return
    }

    // Actions on selected task
    if (!selectedTaskId) return

    const allTasks = getAllTasks()
    const selectedTask = allTasks.find((t) => t.id === selectedTaskId)
    if (!selectedTask) return

    // Edit task: e or Enter
    if (e.key === 'e' || e.key === 'Enter') {
      e.preventDefault()
      onEditTask(selectedTask)
      return
    }

    // Delete task: d or Backspace
    if (e.key === 'd' || e.key === 'Backspace') {
      e.preventDefault()
      onDeleteTask(selectedTask)
      return
    }

    // Add/Edit link: l
    if (e.key === 'l') {
      e.preventDefault()
      onLinkTask(selectedTask)
      return
    }

    // Open link: o
    if (e.key === 'o') {
      e.preventDefault()
      if (selectedTask.link) {
        onOpenLink(selectedTask)
      }
      return
    }

    // Toggle done: x or Space
    if (e.key === 'x' || e.key === ' ') {
      e.preventDefault()
      
      // If completing a todo task, move selection to next todo task
      if (selectedTask.status === 'todo') {
        const currentIndex = todoTasks.findIndex((t) => t.id === selectedTaskId)
        
        // Find next todo task to select (after this one completes)
        let nextTaskId: string | null = null
        if (todoTasks.length > 1) {
          // If there's a task after this one, select it
          if (currentIndex < todoTasks.length - 1) {
            nextTaskId = todoTasks[currentIndex + 1].id
          } 
          // Otherwise select the previous task
          else if (currentIndex > 0) {
            nextTaskId = todoTasks[currentIndex - 1].id
          }
        }
        
        // Toggle the task
        toggleTaskDone(selectedTaskId)
        
        // Update selection to stay in todo list
        setSelectedTaskId(nextTaskId)
      } else {
        // If uncompleting a done task, just toggle it
        toggleTaskDone(selectedTaskId)
      }
      return
    }

    // 1/2/3/4: Set priority
    if (PRIORITY_MAP[e.key]) {
      e.preventDefault()
      updateTask(selectedTaskId, { priority: PRIORITY_MAP[e.key] })
      return
    }

    // Escape: Deselect
    if (e.key === 'Escape') {
      e.preventDefault()
      setSelectedTaskId(null)
      return
    }
  }, [
    enabled,
    isReadOnly,
    selectedTaskId,
    todoTasks,
    navigateSelection,
    updateTask,
    toggleTaskDone,
    reorderTask,
    onAddTask,
    onEditTask,
    onDeleteTask,
    onLinkTask,
    onOpenLink,
    setSelectedTaskId,
    getAllTasks,
  ])

  // Attach event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return {
    navigateSelection,
  }
}
