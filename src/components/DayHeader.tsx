'use client'

import { useApp } from '@/lib/context'
import { formatDate, getToday } from '@/types'

export function DayHeader() {
  const {
    selectedDate,
    today,
    isReadOnly,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    carryoverCount,
    setShowSettings,
    user,
    signOut,
  } = useApp()

  const canGoNext = selectedDate < today

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header 
      className="flex-shrink-0 bg-surface border-b-2 border-border relative"
      style={{ zIndex: 20 }}
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Top row: Logo + User Menu */}
        <div className="flex items-center justify-between mb-4">
          <h1 
            className="text-2xl text-text-primary flex items-center gap-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '3px' }}
          >
            <span 
              className="text-sm px-2 py-1"
              style={{ 
                background: 'var(--accent)',
                color: '#000',
                clipPath: 'polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)',
              }}
            >
              TASK
            </span>
            TRACKER
          </h1>
          
          <div className="flex items-center gap-2">
            {/* User email indicator */}
            {user && (
              <span className="text-xs text-text-muted truncate max-w-[120px] hidden sm:block">
                {user.email}
              </span>
            )}
            
            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-text-muted hover:text-accent transition-colors"
              aria-label="Settings"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="3" />
                <path d="M11 1v3M11 18v3M1 11h3M18 11h3M3.93 3.93l2.12 2.12M15.95 15.95l2.12 2.12M3.93 18.07l2.12-2.12M15.95 6.05l2.12-2.12" />
              </svg>
            </button>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="p-2 text-text-muted hover:text-priority-p0 transition-colors"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 3h4v16h-4M10 11h10M17 8l3 3-3 3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Day navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousDay}
            className="p-3 text-text-muted hover:text-accent hover:bg-surface-secondary transition-all"
            style={{ clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)' }}
            aria-label="Previous day"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4l-6 6 6 6" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <button
              onClick={goToToday}
              className={`text-2xl transition-colors ${
                selectedDate === today 
                  ? 'text-accent' 
                  : 'text-text-primary hover:text-accent'
              }`}
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '2px' }}
            >
              {formatDate(selectedDate).toUpperCase()}
            </button>
            
            {isReadOnly && (
              <span className="text-xs text-text-muted mt-2 flex items-center gap-1 uppercase tracking-wider">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M9.5 4.5H9V3.5C9 1.84 7.66 0.5 6 0.5C4.34 0.5 3 1.84 3 3.5V4.5H2.5C1.95 4.5 1.5 4.95 1.5 5.5V10.5C1.5 11.05 1.95 11.5 2.5 11.5H9.5C10.05 11.5 10.5 11.05 10.5 10.5V5.5C10.5 4.95 10.05 4.5 9.5 4.5ZM6 9C5.45 9 5 8.55 5 8C5 7.45 5.45 7 6 7C6.55 7 7 7.45 7 8C7 8.55 6.55 9 6 9ZM7.8 4.5H4.2V3.5C4.2 2.51 5.01 1.7 6 1.7C6.99 1.7 7.8 2.51 7.8 3.5V4.5Z"/>
                </svg>
                Read Only
              </span>
            )}
            
            {!isReadOnly && carryoverCount > 0 && (
              <span className="text-xs mt-2 px-2 py-1 bg-accent-secondary-muted text-accent-secondary uppercase tracking-wider">
                {carryoverCount} carried over
              </span>
            )}
          </div>

          <button
            onClick={goToNextDay}
            disabled={!canGoNext}
            className={`p-3 transition-all ${
              canGoNext 
                ? 'text-text-muted hover:text-accent hover:bg-surface-secondary' 
                : 'opacity-20 cursor-not-allowed text-text-muted'
            }`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)' }}
            aria-label="Next day"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 4l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
