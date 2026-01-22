'use client'

import { useApp } from '@/lib/context'

export function ToastContainer() {
  const { toasts, removeToast } = useApp()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-enter flex items-center gap-3 px-5 py-3 border-l-4"
          style={{
            background: 'var(--surface-secondary)',
            borderColor: toast.type === 'success' 
              ? 'var(--accent)' 
              : toast.type === 'error' 
                ? 'var(--priority-p0)' 
                : 'var(--text-muted)',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
          }}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <span 
            className="text-sm font-medium text-text-primary uppercase tracking-wider"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {toast.message}
          </span>
        </div>
      ))}
    </div>
  )
}
