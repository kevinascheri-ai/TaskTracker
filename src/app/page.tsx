'use client'

import { AppProvider, useApp } from '@/lib/context'
import { DayHeader } from '@/components/DayHeader'
import { TaskList } from '@/components/TaskList'
import { HotkeyBar } from '@/components/HotkeyBar'
import { Settings } from '@/components/Settings'
import { ToastContainer } from '@/components/Toast'
import { TaskModal } from '@/components/TaskModal'
import { DeleteConfirm } from '@/components/DeleteConfirm'
import { LinkModal } from '@/components/LinkModal'

function AppContent() {
  const { 
    isLoaded, 
    showAddModal, 
    setShowAddModal,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    linkingTask,
    setLinkingTask,
  } = useApp()

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div 
          className="text-text-muted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <DayHeader />
      <TaskList />
      <HotkeyBar />
      
      {/* Modals */}
      <Settings />
      <ToastContainer />
      
      {showAddModal && (
        <TaskModal 
          mode="add" 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {editingTask && (
        <TaskModal 
          mode="edit" 
          task={editingTask}
          onClose={() => setEditingTask(null)} 
        />
      )}
      
      {deletingTask && (
        <DeleteConfirm 
          task={deletingTask}
          onClose={() => setDeletingTask(null)} 
        />
      )}

      {linkingTask && (
        <LinkModal 
          task={linkingTask}
          onClose={() => setLinkingTask(null)} 
        />
      )}
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
