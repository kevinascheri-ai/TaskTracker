import { Task, StorageData, Settings, getToday } from '@/types'

// Storage keys
const STORAGE_KEYS = {
  DATA: 'task-tracker-data',
  SETTINGS: 'task-tracker-settings',
} as const

// Abstract storage interface for future swapping to IndexedDB
interface StorageInterface {
  getData(): StorageData
  setData(data: StorageData): void
  getSettings(): Settings
  setSettings(settings: Settings): void
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  theme: 'default',
  quackOnComplete: false,
}

// Default empty data
const DEFAULT_DATA: StorageData = {
  tasks: [],
}

// Seed data - sample tasks for first-time users
const SEED_DATA: StorageData = {
  tasks: [
    {
      id: 'task-1',
      title: 'Review design mockups',
      status: 'todo',
      priority: 'p1',
      order: 0,
      createdAt: new Date().toISOString(),
      dayCreated: getToday(),
    },
    {
      id: 'task-2',
      title: 'Update brand assets',
      status: 'todo',
      priority: 'p2',
      order: 1,
      createdAt: new Date().toISOString(),
      dayCreated: getToday(),
    },
    {
      id: 'task-3',
      title: 'Ship landing page',
      status: 'todo',
      priority: 'p0',
      order: 2,
      createdAt: new Date().toISOString(),
      dayCreated: getToday(),
    },
  ],
}

// localStorage implementation
class LocalStorageAdapter implements StorageInterface {
  private isClient = typeof window !== 'undefined'

  getData(): StorageData {
    if (!this.isClient) return DEFAULT_DATA

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DATA)
      if (!raw) {
        // First time user - seed with sample data
        this.setData(SEED_DATA)
        return SEED_DATA
      }
      return JSON.parse(raw) as StorageData
    } catch {
      return DEFAULT_DATA
    }
  }

  setData(data: StorageData): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.DATA, JSON.stringify(data))
  }

  getSettings(): Settings {
    if (!this.isClient) return DEFAULT_SETTINGS

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!raw) return DEFAULT_SETTINGS
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_SETTINGS
    }
  }

  setSettings(settings: Settings): void {
    if (!this.isClient) return
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  }
}

// Export singleton instance
export const storage = new LocalStorageAdapter()

// Utility: Generate unique IDs
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// CRUD Operations for Tasks
export const tasksApi = {
  getAll(): Task[] {
    return storage.getData().tasks
  },

  getById(id: string): Task | undefined {
    return storage.getData().tasks.find((t) => t.id === id)
  },

  // Get tasks for today's view: today's tasks + incomplete tasks from previous days
  getTodayTasks(): Task[] {
    const today = getToday()
    const allTasks = storage.getData().tasks
    
    return allTasks.filter((t) => {
      // Include if created today
      if (t.dayCreated === today) return true
      // Include if from previous day AND still incomplete
      if (t.dayCreated < today && t.status === 'todo') return true
      return false
    })
  },

  // Get tasks for a specific past day (read-only view)
  // Shows tasks that were completed on that day
  getTasksForDay(date: string): Task[] {
    const today = getToday()
    
    // If it's today, use getTodayTasks
    if (date === today) {
      return this.getTodayTasks()
    }
    
    // For past days, show tasks that were completed on that day
    const allTasks = storage.getData().tasks
    
    return allTasks.filter((t) => {
      // Task was completed on this specific day
      if (t.completedAt) {
        const completedDay = t.completedAt.split('T')[0]
        if (completedDay === date) return true
      }
      return false
    })
  },

  create(data: Omit<Task, 'id' | 'createdAt' | 'dayCreated'>): Task {
    const now = new Date().toISOString()
    const task: Task = {
      ...data,
      id: generateId('task'),
      createdAt: now,
      dayCreated: getToday(),
    }
    const storageData = storage.getData()
    storageData.tasks.push(task)
    storage.setData(storageData)
    return task
  },

  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'dayCreated'>>): Task | null {
    const storageData = storage.getData()
    const index = storageData.tasks.findIndex((t) => t.id === id)
    if (index === -1) return null

    const wasNotDone = storageData.tasks[index].status !== 'done'
    const isNowDone = updates.status === 'done'

    storageData.tasks[index] = {
      ...storageData.tasks[index],
      ...updates,
      // Set completedAt when marking as done
      completedAt: wasNotDone && isNowDone 
        ? new Date().toISOString() 
        : updates.status === 'todo' 
          ? undefined 
          : storageData.tasks[index].completedAt,
    }
    storage.setData(storageData)
    return storageData.tasks[index]
  },

  delete(id: string): boolean {
    const storageData = storage.getData()
    const index = storageData.tasks.findIndex((t) => t.id === id)
    if (index === -1) return false

    storageData.tasks.splice(index, 1)
    storage.setData(storageData)
    return true
  },

  // Reorder task within its status group
  reorder(taskId: string, direction: 'up' | 'down'): boolean {
    const storageData = storage.getData()
    const task = storageData.tasks.find((t) => t.id === taskId)
    if (!task) return false

    // Get tasks in same status group, sorted by order
    const today = getToday()
    const todayTasks = storageData.tasks
      .filter((t) => {
        if (t.dayCreated === today) return true
        if (t.dayCreated < today && t.status === 'todo') return true
        return false
      })
      .filter((t) => t.status === task.status)
      .sort((a, b) => a.order - b.order)

    const currentIndex = todayTasks.findIndex((t) => t.id === taskId)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= todayTasks.length) return false

    // Swap orders
    const tempOrder = todayTasks[currentIndex].order
    todayTasks[currentIndex].order = todayTasks[swapIndex].order
    todayTasks[swapIndex].order = tempOrder

    storage.setData(storageData)
    return true
  },

  // Get next order number for new tasks
  getNextOrder(): number {
    const tasks = this.getTodayTasks().filter((t) => t.status === 'todo')
    return tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) + 1 : 0
  },

  // Get list of days that have tasks (for navigation)
  getDaysWithTasks(): string[] {
    const allTasks = storage.getData().tasks
    const days = new Set<string>()
    
    allTasks.forEach((t) => {
      days.add(t.dayCreated)
      if (t.completedAt) {
        days.add(t.completedAt.split('T')[0])
      }
    })
    
    // Always include today
    days.add(getToday())
    
    return Array.from(days).sort().reverse()
  },
}

// Settings API
export const settingsApi = {
  get(): Settings {
    return storage.getSettings()
  },

  update(updates: Partial<Settings>): Settings {
    const current = storage.getSettings()
    const updated = { ...current, ...updates }
    storage.setSettings(updated)
    return updated
  },
}
