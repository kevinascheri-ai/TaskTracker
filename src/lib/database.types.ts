// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          status: 'todo' | 'done'
          priority: 'p0' | 'p1' | 'p2' | 'p3'
          link: string | null
          order_index: number
          day_created: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          status?: 'todo' | 'done'
          priority?: 'p0' | 'p1' | 'p2' | 'p3'
          link?: string | null
          order_index?: number
          day_created: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: 'todo' | 'done'
          priority?: 'p0' | 'p1' | 'p2' | 'p3'
          link?: string | null
          order_index?: number
          day_created?: string
          created_at?: string
          completed_at?: string | null
        }
      }
      settings: {
        Row: {
          user_id: string
          quack_on_complete: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          quack_on_complete?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          quack_on_complete?: boolean
          created_at?: string
        }
      }
    }
  }
}
