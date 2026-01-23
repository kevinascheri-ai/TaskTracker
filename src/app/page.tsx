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
import { AuthModal } from '@/components/AuthModal'

function AppContent() {
  const { 
    isLoaded,
    user,
    authLoading,
    showAddModal, 
    setShowAddModal,
    editingTask,
    setEditingTask,
    deletingTask,
    setDeletingTask,
    linkingTask,
    setLinkingTask,
    isSyncing,
  } = useApp()

  // Auth loading state
  if (authLoading) {
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

  // Not authenticated - show auth modal
  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 
            className="text-4xl text-text-primary flex items-center justify-center gap-4 mb-4"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '4px' }}
          >
            <span 
              className="text-xl px-3 py-1"
              style={{ 
                background: 'var(--accent)',
                color: '#000',
                clipPath: 'polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)',
              }}
            >
              TASK
            </span>
            TRACKER
          </h1>
          <p className="text-text-muted uppercase tracking-widest text-sm">
            Keyboard-first task management
          </p>
        </div>
        <AuthModal />
      </div>
    )
  }

  // Data loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div 
          className="text-text-muted uppercase tracking-widest"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Loading tasks...
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-surface flex flex-col overflow-hidden">
      <DayHeader />
      
      {/* Sync indicator */}
      {isSyncing && (
        <div className="absolute top-2 right-16 z-30">
          <div 
            className="text-xs text-accent uppercase tracking-wider animate-pulse"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Syncing...
          </div>
        </div>
      )}
      
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
