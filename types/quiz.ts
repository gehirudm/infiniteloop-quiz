export interface Question {
  id: string
  type: "mcq" | "text"
  question: string
  options?: string[]
  correctAnswer: string
  timeLimit: number // in seconds
}

export interface QuizSession {
  username: string
  currentQuestionIndex: number
  answers: Record<string, string>
  startTime: number
  completed: boolean
}

export interface QuizResult {
  username: string
  score: number
  totalQuestions: number
  completedAt: string
}
