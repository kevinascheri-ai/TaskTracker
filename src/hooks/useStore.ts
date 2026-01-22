'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task, Settings, getToday, Priority } from '@/types'
import { tasksApi, settingsApi } from '@/lib/storage'

// Custom hook for managing app state with localStorage persistence
export function useStore() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettings] = useState<Settings>({ theme: 'default', quackOnComplete: false })
  const [selectedDate, setSelectedDate] = useState<string>(getToday())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const today = getToday()
  const isViewingToday = selectedDate === today
  const isReadOnly = !isViewingToday

  // Load data on mount
  useEffect(() => {
    setTasks(tasksApi.getAll())
    setSettings(settingsApi.get())
    setIsLoaded(true)
  }, [])

  // Refresh data from storage
  const refresh = useCallback(() => {
    setTasks(tasksApi.getAll())
  }, [])

  // Task operations
  const createTask = useCallback((title: string, priority: Priority = 'p2') => {
    const task = tasksApi.create({
      title,
      status: 'todo',
      priority,
      order: tasksApi.getNextOrder(),
    })
    refresh()
    return task
  }, [refresh])

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'dayCreated'>>) => {
    const task = tasksApi.update(id, updates)
    refresh()
    return task
  }, [refresh])

  const deleteTask = useCallback((id: string) => {
    const success = tasksApi.delete(id)
    if (success) {
      refresh()
      if (selectedTaskId === id) {
        setSelectedTaskId(null)
      }
    }
    return success
  }, [refresh, selectedTaskId])

  const toggleTaskDone = useCallback((id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return null
    
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    return updateTask(id, { status: newStatus })
  }, [tasks, updateTask])

  const reorderTask = useCallback((taskId: string, direction: 'up' | 'down') => {
    const success = tasksApi.reorder(taskId, direction)
    if (success) refresh()
    return success
  }, [refresh])

  // Settings operations
  const updateSettings = useCallback((updates: Partial<Settings>) => {
    const updated = settingsApi.update(updates)
    setSettings(updated)
    return updated
  }, [])

  // Navigation
  const goToToday = useCallback(() => {
    setSelectedDate(getToday())
    setSelectedTaskId(null)
  }, [])

  const goToDate = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedTaskId(null)
  }, [])

  const goToPreviousDay = useCallback(() => {
    const current = new Date(selectedDate + 'T00:00:00')
    current.setDate(current.getDate() - 1)
    setSelectedDate(current.toISOString().split('T')[0])
    setSelectedTaskId(null)
  }, [selectedDate])

  const goToNextDay = useCallback(() => {
    const current = new Date(selectedDate + 'T00:00:00')
    current.setDate(current.getDate() + 1)
    const next = current.toISOString().split('T')[0]
    // Don't go past today
    if (next <= today) {
      setSelectedDate(next)
      setSelectedTaskId(null)
    }
  }, [selectedDate, today])

  // Computed: tasks for the selected date
  const currentTasks = useMemo(() => {
    if (selectedDate === today) {
      // Today: show today's tasks + incomplete carryovers
      return tasks.filter((t) => {
        if (t.dayCreated === today) return true
        if (t.dayCreated < today && t.status === 'todo') return true
        return false
      })
    } else {
      // Past day: show tasks completed on that day
      return tasks.filter((t) => {
        if (t.completedAt) {
          const completedDay = t.completedAt.split('T')[0]
          if (completedDay === selectedDate) return true
        }
        return false
      })
    }
  }, [tasks, selectedDate, today])

  // Split into todo and done
  const todoTasks = useMemo(() => {
    return currentTasks
      .filter((t) => t.status === 'todo')
      .sort((a, b) => {
        // Sort by priority first, then by order
        const priorityOrder = { p0: 0, p1: 1, p2: 2, p3: 3 }
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }
        return a.order - b.order
      })
  }, [currentTasks])

  const doneTasks = useMemo(() => {
    return currentTasks
      .filter((t) => t.status === 'done')
      .sort((a, b) => {
        // Sort by completion time, most recent first
        const aTime = a.completedAt || a.createdAt
        const bTime = b.completedAt || b.createdAt
        return bTime.localeCompare(aTime)
      })
  }, [currentTasks])

  // Days with tasks (for navigation)
  const daysWithTasks = useMemo(() => {
    return tasksApi.getDaysWithTasks()
  }, [tasks])

  // Carryover count (tasks from previous days)
  const carryoverCount = useMemo(() => {
    if (selectedDate !== today) return 0
    return currentTasks.filter((t) => t.dayCreated < today && t.status === 'todo').length
  }, [currentTasks, selectedDate, today])

  return {
    // State
    tasks,
    settings,
    selectedDate,
    selectedTaskId,
    isLoaded,
    isReadOnly,
    isViewingToday,
    today,

    // Computed
    currentTasks,
    todoTasks,
    doneTasks,
    daysWithTasks,
    carryoverCount,

    // Setters
    setSelectedTaskId,

    // Task operations
    createTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    reorderTask,

    // Settings
    updateSettings,

    // Navigation
    goToToday,
    goToDate,
    goToPreviousDay,
    goToNextDay,
  }
}

// Export type for context
export type StoreType = ReturnType<typeof useStore>
