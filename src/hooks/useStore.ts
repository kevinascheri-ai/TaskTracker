'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Task, Settings, getToday, Priority } from '@/types'
import { tasksApi, settingsApi } from '@/lib/storage'

// Default settings
const DEFAULT_SETTINGS: Settings = {
  theme: 'default',
  quackOnComplete: false,
  timezone: 'America/Los_Angeles',
  dayRolloverHour: 17,
}

// Custom hook for managing app state with Supabase persistence
export function useStore(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Compute today based on user's timezone and rollover settings
  const today = useMemo(() => {
    return getToday(settings.timezone, settings.dayRolloverHour)
  }, [settings.timezone, settings.dayRolloverHour])
  
  // Initialize selectedDate when today changes or on first load
  useEffect(() => {
    if (!selectedDate || selectedDate === '') {
      setSelectedDate(today)
    }
  }, [today, selectedDate])

  const isViewingToday = selectedDate === today
  const isReadOnly = !isViewingToday

  // Load data when user changes
  useEffect(() => {
    if (!userId) {
      setTasks([])
      setSettings(DEFAULT_SETTINGS)
      setSelectedDate('')
      setIsLoaded(true)
      return
    }

    const loadData = async () => {
      setIsSyncing(true)
      try {
        const [tasksData, settingsData] = await Promise.all([
          tasksApi.getAll(userId),
          settingsApi.get(userId),
        ])
        setTasks(tasksData)
        setSettings(settingsData)
        // Set selected date based on loaded settings
        const userToday = getToday(settingsData.timezone, settingsData.dayRolloverHour)
        setSelectedDate(userToday)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoaded(true)
        setIsSyncing(false)
      }
    }

    loadData()
  }, [userId])

  // Refresh data from storage
  const refresh = useCallback(async () => {
    if (!userId) return
    setIsSyncing(true)
    try {
      const tasksData = await tasksApi.getAll(userId)
      setTasks(tasksData)
    } finally {
      setIsSyncing(false)
    }
  }, [userId])

  // Task operations
  const createTask = useCallback(async (title: string, priority: Priority = 'p2') => {
    if (!userId) return null
    
    const order = await tasksApi.getNextOrder(userId, settings.timezone, settings.dayRolloverHour)
    const task = await tasksApi.create(userId, {
      title,
      status: 'todo',
      priority,
      order,
    }, settings.timezone, settings.dayRolloverHour)
    
    if (task) {
      setTasks(prev => [...prev, task])
    }
    return task
  }, [userId, settings.timezone, settings.dayRolloverHour])

  const updateTask = useCallback(async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'dayCreated'>>) => {
    const task = await tasksApi.update(id, updates)
    if (task) {
      setTasks(prev => prev.map(t => t.id === id ? task : t))
    }
    return task
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const success = await tasksApi.delete(id)
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id))
      if (selectedTaskId === id) {
        setSelectedTaskId(null)
      }
    }
    return success
  }, [selectedTaskId])

  const toggleTaskDone = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return null
    
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    const completedAt = newStatus === 'done' ? new Date().toISOString() : undefined
    
    return updateTask(id, { status: newStatus, completedAt })
  }, [tasks, updateTask])

  const reorderTask = useCallback(async (taskId: string, direction: 'up' | 'down') => {
    if (!userId) return false
    const success = await tasksApi.reorder(taskId, userId, direction, settings.timezone, settings.dayRolloverHour)
    if (success) {
      await refresh()
    }
    return success
  }, [userId, refresh, settings.timezone, settings.dayRolloverHour])

  // Reorder tasks by drag and drop
  const reorderTaskToPosition = useCallback(async (taskId: string, newIndex: number, taskIds: string[]) => {
    if (!userId) return false
    
    // Optimistically update the UI
    const oldTasks = [...tasks]
    const reorderedTasks = taskIds.map((id, index) => {
      const task = tasks.find(t => t.id === id)
      if (task) {
        return { ...task, order: index }
      }
      return null
    }).filter(Boolean) as Task[]
    
    setTasks(prev => {
      const otherTasks = prev.filter(t => !taskIds.includes(t.id))
      return [...otherTasks, ...reorderedTasks]
    })
    
    const success = await tasksApi.reorderToPosition(taskId, userId, newIndex, taskIds)
    if (!success) {
      // Rollback on failure
      setTasks(oldTasks)
    }
    return success
  }, [userId, tasks])

  // Settings operations
  const updateSettings = useCallback(async (updates: Partial<Settings>) => {
    if (!userId) return settings
    const updated = await settingsApi.update(userId, updates)
    setSettings(updated)
    return updated
  }, [userId, settings])

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
    isSyncing,
    today,

    // Computed
    currentTasks,
    todoTasks,
    doneTasks,
    carryoverCount,

    // Setters
    setSelectedTaskId,

    // Task operations
    createTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    reorderTask,
    reorderTaskToPosition,

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
