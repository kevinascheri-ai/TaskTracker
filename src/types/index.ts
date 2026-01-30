// Core entity types for the day-based task tracker

export type TaskStatus = 'todo' | 'done'
export type Priority = 'p0' | 'p1' | 'p2' | 'p3'

export interface Task {
  id: string
  title: string
  status: TaskStatus
  priority: Priority
  order: number
  link?: string // Optional reference link (JIRA, Figma, etc.)
  createdAt: string // ISO datetime
  completedAt?: string // ISO datetime when marked done
  dayCreated: string // ISO date (YYYY-MM-DD) - the day this task was originally created
}

// Storage interface - abstracted for future swapping to IndexedDB
export interface StorageData {
  tasks: Task[]
}

export interface Settings {
  theme: 'default' // Single theme now - extreme sports aesthetic
  quackOnComplete: boolean // Celebration mode
  timezone: string // User's timezone (e.g., 'America/Los_Angeles')
  dayRolloverHour: number // Hour when tasks roll over to new day (0-23, default 17 = 5pm)
}

// Common timezones for the dropdown
export const TIMEZONES = [
  { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
  { value: 'America/Anchorage', label: 'Alaska (AKST)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PST)' },
  { value: 'America/Denver', label: 'Mountain (MST)' },
  { value: 'America/Chicago', label: 'Central (CST)' },
  { value: 'America/New_York', label: 'Eastern (EST)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

// Rollover time options
export const ROLLOVER_HOURS = [
  { value: 0, label: '12:00 AM (Midnight)' },
  { value: 3, label: '3:00 AM' },
  { value: 5, label: '5:00 AM' },
  { value: 6, label: '6:00 AM' },
  { value: 17, label: '5:00 PM' },
  { value: 18, label: '6:00 PM' },
  { value: 21, label: '9:00 PM' },
  { value: 23, label: '11:00 PM' },
]

// Helper to get today's date as ISO string based on timezone and rollover hour
export function getToday(timezone?: string, rolloverHour?: number): string {
  const tz = timezone || 'America/Los_Angeles'
  const rollover = rolloverHour ?? 17 // Default 5pm
  
  // Get current time in the specified timezone
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  })
  
  const parts = formatter.formatToParts(now)
  const year = parts.find(p => p.type === 'year')?.value || ''
  const month = parts.find(p => p.type === 'month')?.value || ''
  const day = parts.find(p => p.type === 'day')?.value || ''
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10)
  
  // If current hour is before rollover, treat as previous day
  if (hour < rollover) {
    const yesterday = new Date(now)
    // Create date in UTC, then adjust
    const localDate = new Date(`${year}-${month}-${day}T00:00:00`)
    localDate.setDate(localDate.getDate() - 1)
    return localDate.toISOString().split('T')[0]
  }
  
  return `${year}-${month}-${day}`
}

// Helper to format date for display
export function formatDate(dateStr: string, timezone?: string, rolloverHour?: number): string {
  const today = getToday(timezone, rolloverHour)
  const yesterdayDate = new Date(today + 'T00:00:00')
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterday = yesterdayDate.toISOString().split('T')[0]
  
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Helper to get date N days ago from today (using timezone)
export function getDaysAgo(n: number, timezone?: string, rolloverHour?: number): string {
  const today = getToday(timezone, rolloverHour)
  const date = new Date(today + 'T00:00:00')
  date.setDate(date.getDate() - n)
  return date.toISOString().split('T')[0]
}

// Helper to extract domain from URL for display
export function getLinkLabel(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    // Common service detection
    if (hostname.includes('jira') || hostname.includes('atlassian')) return 'Jira'
    if (hostname.includes('figma')) return 'Figma'
    if (hostname.includes('github')) return 'GitHub'
    if (hostname.includes('notion')) return 'Notion'
    if (hostname.includes('linear')) return 'Linear'
    if (hostname.includes('asana')) return 'Asana'
    if (hostname.includes('trello')) return 'Trello'
    if (hostname.includes('slack')) return 'Slack'
    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('dropbox')) return 'Dropbox'
    // Default: show shortened hostname
    return hostname.split('.')[0]
  } catch {
    return 'Link'
  }
}
