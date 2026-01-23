import { Task, Settings, getToday } from '@/types'
import { getSupabase } from './supabase'

// Convert database row to Task type
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    priority: row.priority,
    link: row.link || undefined,
    order: row.order_index,
    createdAt: row.created_at,
    completedAt: row.completed_at || undefined,
    dayCreated: row.day_created,
  }
}

// CRUD Operations for Tasks (Supabase)
export const tasksApi = {
  async getAll(userId: string): Promise<Task[]> {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
      return []
    }

    return (data || []).map(rowToTask)
  },

  async create(userId: string, task: Omit<Task, 'id' | 'createdAt' | 'dayCreated'>): Promise<Task | null> {
    const supabase = getSupabase()
    const now = new Date().toISOString()
    const today = getToday()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        title: task.title,
        status: task.status,
        priority: task.priority,
        link: task.link || null,
        order_index: task.order,
        day_created: today,
        created_at: now,
        completed_at: null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return null
    }

    return rowToTask(data)
  },

  async update(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    const supabase = getSupabase()
    
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.status !== undefined) updateData.status = updates.status
    if (updates.priority !== undefined) updateData.priority = updates.priority
    if (updates.link !== undefined) updateData.link = updates.link || null
    if (updates.order !== undefined) updateData.order_index = updates.order
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt || null

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId)
      .select()
      .single()

    if (error) {
      console.error('Error updating task:', error)
      return null
    }

    return rowToTask(data)
  },

  async delete(taskId: string): Promise<boolean> {
    const supabase = getSupabase()
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      console.error('Error deleting task:', error)
      return false
    }

    return true
  },

  async getNextOrder(userId: string): Promise<number> {
    const supabase = getSupabase()
    const today = getToday()
    
    const { data } = await supabase
      .from('tasks')
      .select('order_index')
      .eq('user_id', userId)
      .eq('status', 'todo')
      .or(`day_created.eq.${today},and(day_created.lt.${today},status.eq.todo)`)
      .order('order_index', { ascending: false })
      .limit(1)

    if (data && data.length > 0) {
      return data[0].order_index + 1
    }
    return 0
  },

  async reorder(taskId: string, userId: string, direction: 'up' | 'down'): Promise<boolean> {
    const supabase = getSupabase()
    
    // Get current task
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single()

    if (!currentTask) return false

    // Get tasks in same status group
    const today = getToday()
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', currentTask.status)
      .order('order_index', { ascending: true })

    if (!tasks) return false

    // Filter to today's tasks + carryovers
    const relevantTasks = tasks.filter((t: any) => {
      if (t.day_created === today) return true
      if (t.day_created < today && t.status === 'todo') return true
      return false
    })

    const currentIndex = relevantTasks.findIndex((t: any) => t.id === taskId)
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (swapIndex < 0 || swapIndex >= relevantTasks.length) return false

    // Swap orders
    const currentOrder = relevantTasks[currentIndex].order_index
    const swapOrder = relevantTasks[swapIndex].order_index

    await supabase
      .from('tasks')
      .update({ order_index: swapOrder })
      .eq('id', relevantTasks[currentIndex].id)

    await supabase
      .from('tasks')
      .update({ order_index: currentOrder })
      .eq('id', relevantTasks[swapIndex].id)

    return true
  },
}

// Settings API (Supabase)
export const settingsApi = {
  async get(userId: string): Promise<Settings> {
    const supabase = getSupabase()
    
    const { data } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (data) {
      return {
        theme: 'default',
        quackOnComplete: data.quack_on_complete,
      }
    }

    // Create default settings if none exist
    await supabase
      .from('settings')
      .insert({ user_id: userId, quack_on_complete: false })

    return { theme: 'default', quackOnComplete: false }
  },

  async update(userId: string, updates: Partial<Settings>): Promise<Settings> {
    const supabase = getSupabase()
    
    const updateData: any = {}
    if (updates.quackOnComplete !== undefined) {
      updateData.quack_on_complete = updates.quackOnComplete
    }

    await supabase
      .from('settings')
      .upsert({ 
        user_id: userId, 
        ...updateData 
      })

    return this.get(userId)
  },
}
