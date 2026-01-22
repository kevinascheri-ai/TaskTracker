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
}

// Helper to get today's date as ISO string
export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

// Helper to format date for display
export function formatDate(dateStr: string): string {
  const today = getToday()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Helper to get date N days ago
export function getDaysAgo(n: number): string {
  const date = new Date()
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
