import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface QuizSession {
  id?: string
  username: string
  current_question_index: number
  answers: Record<string, string>
  start_time: number
  completed: boolean
  created_at?: string
  updated_at?: string
}

export interface QuizResult {
  id?: string
  username: string
  score: number
  total_questions: number
  total_time_seconds: number
  completed_at?: string
  created_at?: string
}

export interface QuestionTiming {
  id?: string
  username: string
  question_id: string
  question_start_time: number
  question_end_time?: number
  time_taken_seconds?: number
  created_at?: string
}
