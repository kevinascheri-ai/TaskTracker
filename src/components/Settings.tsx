'use client'

import { useApp } from '@/lib/context'

export function Settings() {
  const { settings, updateSettings, showSettings, setShowSettings } = useApp()

  if (!showSettings) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => setShowSettings(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 modal-backdrop" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-surface-secondary border border-border"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 
            className="text-xl text-text-primary"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px' }}
          >
            SETTINGS
          </h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 text-text-muted hover:text-text-primary transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5l10 10M15 5l-10 10" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Celebration Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-surface rounded-sm">
            <div>
              <p 
                className="text-sm text-text-primary uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Celebration Mode
              </p>
              <p className="text-xs text-text-muted mt-1">
                Extra flair when completing tasks
              </p>
            </div>
            <button
              onClick={() => updateSettings({ quackOnComplete: !settings.quackOnComplete })}
              className={`relative w-12 h-7 transition-colors ${
                settings.quackOnComplete ? 'bg-accent' : 'bg-surface-tertiary'
              }`}
              style={{ clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)' }}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white transition-all ${
                  settings.quackOnComplete ? 'left-6' : 'left-1'
                }`}
                style={{ clipPath: 'polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)' }}
              />
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 
              className="text-sm text-text-muted mb-4 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Keyboard Shortcuts
            </h3>
            <div className="bg-surface p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">New task</span>
                <span><span className="kbd kbd-accent">N</span> or <span className="kbd">A</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Navigate</span>
                <span><span className="kbd">J</span> <span className="kbd">K</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Complete</span>
                <span><span className="kbd">X</span> or <span className="kbd">Space</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Edit</span>
                <span><span className="kbd">E</span> or <span className="kbd">Enter</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Add/Edit link</span>
                <span><span className="kbd">L</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Open link</span>
                <span><span className="kbd">O</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Delete</span>
                <span><span className="kbd">D</span> or <span className="kbd">⌫</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Priority</span>
                <span><span className="kbd">1</span> <span className="kbd">2</span> <span className="kbd">3</span> <span className="kbd">4</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase tracking-wider text-xs">Reorder</span>
                <span><span className="kbd">⌘↑</span> <span className="kbd">⌘↓</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-surface">
          <p 
            className="text-xs text-text-muted text-center uppercase tracking-widest"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Get it done.
          </p>
        </div>
      </div>
    </div>
  )
}
