'use client'

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { useStore, StoreType } from '@/hooks/useStore'
import { useToast, ToastType } from '@/hooks/useToast'
import { Task } from '@/types'

interface AppContextType extends StoreType, ToastType {
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  // Modal states
  showAddModal: boolean
  setShowAddModal: (show: boolean) => void
  editingTask: Task | null
  setEditingTask: (task: Task | null) => void
  deletingTask: Task | null
  setDeletingTask: (task: Task | null) => void
  linkingTask: Task | null
  setLinkingTask: (task: Task | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useStore()
  const toast = useToast()
  const [showSettings, setShowSettings] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [linkingTask, setLinkingTask] = useState<Task | null>(null)

  // Enhanced task toggle with toast
  const handleToggleTask = useCallback((taskId: string) => {
    const task = store.tasks.find((t) => t.id === taskId)
    if (!task) return null

    const result = store.toggleTaskDone(taskId)
    
    if (result && task.status === 'todo') {
      // Was todo, now done
      const message = store.settings.quackOnComplete 
        ? '🔥 CRUSHED IT!'
        : 'Task completed'
      
      toast.addToast(message, 'success')
    }
    
    return result
  }, [store, toast])

  const value: AppContextType = {
    ...store,
    ...toast,
    showSettings,
    setShowSettings,
    showAddModal,
    setShowAddModal,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    linkingTask,
    setLinkingTask,
    // Override toggleTaskDone to add toast
    toggleTaskDone: handleToggleTask,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
