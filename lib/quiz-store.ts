import { supabase } from "./supabase"
import type { QuizSession, QuizResult, QuestionTiming } from "./supabase"

export async function createSession(username: string): Promise<QuizSession | null> {
  const session: Omit<QuizSession, "id" | "created_at" | "updated_at"> = {
    username,
    current_question_index: 0,
    answers: {},
    start_time: Date.now(),
    completed: false,
  }

  const { data, error } = await supabase.from("quiz_sessions").insert([session]).select().single()

  if (error) {
    console.error("Error creating session:", error)
    return null
  }

  return data
}

export async function getSession(username: string): Promise<QuizSession | null> {
  const { data, error } = await supabase.from("quiz_sessions").select("*").eq("username", username).single()

  if (error) {
    return null
  }

  return data
}

export async function updateSession(username: string, updates: Partial<QuizSession>): Promise<QuizSession | null> {
  const { data, error } = await supabase
    .from("quiz_sessions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("username", username)
    .select()
    .single()

  if (error) {
    console.error("Error updating session:", error)
    return null
  }

  return data
}

export async function saveResult(result: Omit<QuizResult, "id" | "created_at">): Promise<void> {
  const { error } = await supabase.from("quiz_results").insert([result])

  if (error) {
    console.error("Error saving result:", error)
  }
}

export async function getResult(username: string): Promise<QuizResult | null> {
  const { data, error } = await supabase.from("quiz_results").select("*").eq("username", username).single()

  if (error) {
    return null
  }

  return data
}

export async function hasUserCompletedQuiz(username: string): Promise<boolean> {
  const { data, error } = await supabase.from("quiz_results").select("id").eq("username", username).single()

  return !error && !!data
}

export async function startQuestionTiming(username: string, questionId: string): Promise<void> {
  const timing: Omit<QuestionTiming, "id" | "created_at"> = {
    username,
    question_id: questionId,
    question_start_time: Date.now(),
  }

  const { error } = await supabase.from("question_timings").upsert([timing], { onConflict: "username,question_id" })

  if (error) {
    console.error("Error starting question timing:", error)
  }
}

export async function endQuestionTiming(username: string, questionId: string): Promise<number> {
  const endTime = Date.now()

  const { data: existingTiming, error: fetchError } = await supabase
    .from("question_timings")
    .select("question_start_time")
    .eq("username", username)
    .eq("question_id", questionId)
    .single()

  if (fetchError || !existingTiming) {
    console.error("Error fetching question timing:", fetchError)
    return 0
  }

  const timeTaken = Math.round((endTime - existingTiming.question_start_time) / 1000)

  const { error: updateError } = await supabase
    .from("question_timings")
    .update({
      question_end_time: endTime,
      time_taken_seconds: timeTaken,
    })
    .eq("username", username)
    .eq("question_id", questionId)

  if (updateError) {
    console.error("Error updating question timing:", updateError)
  }

  return timeTaken
}

export async function getTotalQuizTime(username: string): Promise<number> {
  const { data, error } = await supabase.from("question_timings").select("time_taken_seconds").eq("username", username)

  if (error) {
    console.error("Error getting total quiz time:", error)
    return 0
  }

  return data.reduce((total, timing) => total + (timing.time_taken_seconds || 0), 0)
}

export async function getLeaderboard(): Promise<QuizResult[]> {
  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .order("score", { ascending: false }) // Sort by score instead of accuracy
    .limit(50)

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }

  return data
}

// Admin functions for resetting system state
export async function resetAllData(): Promise<boolean> {
  try {
    // Delete all data from all tables
    const { error: sessionsError } = await supabase
      .from("quiz_sessions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
    const { error: resultsError } = await supabase
      .from("quiz_results")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
    const { error: timingsError } = await supabase
      .from("question_timings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")
    const { error: clicksError } = await supabase.from("clicks").delete().neq("id", 0)

    if (sessionsError || resultsError || timingsError || clicksError) {
      console.error("Error resetting data:", { sessionsError, resultsError, timingsError, clicksError })
      return false
    }

    return true
  } catch (error) {
    console.error("Failed to reset data:", error)
    return false
  }
}
