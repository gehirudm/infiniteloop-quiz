import type { Question } from "@/types/quiz"

export const QUIZ_QUESTIONS: Question[] = [
  {
    id: "1",
    type: "mcq",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: "Paris",
    timeLimit: 30,
  },
  {
    id: "2",
    type: "text",
    question: "What is the largest planet in our solar system?",
    correctAnswer: "Jupiter",
    timeLimit: 25,
  },
  {
    id: "3",
    type: "mcq",
    question: "Which programming language is known for its use in web development?",
    options: ["Python", "JavaScript", "C++", "Java"],
    correctAnswer: "JavaScript",
    timeLimit: 20,
  },
  {
    id: "4",
    type: "text",
    question: "What does HTML stand for?",
    correctAnswer: "HyperText Markup Language",
    timeLimit: 30,
  },
  {
    id: "5",
    type: "mcq",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    timeLimit: 15,
  },
]

export const API_KEY = process.env.QUIZ_API_KEY || "quiz-api-key-2024-secure"
