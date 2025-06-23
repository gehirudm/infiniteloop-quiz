import type { Question } from "@/types/quiz"

export const QUIZ_QUESTIONS: Question[] = [
  {
    "id": "1",
    "type": "text",
    "question": "What is the correct way to print 'Hello World' in Python?",
    "correctAnswer": "print('Hello World')",
    "timeLimit": 20
  },
  {
    "id": "2",
    "type": "mcq",
    "question": "What naming convention should you use for variables in Python?",
    "options": ["camelCase", "PascalCase", "snake_case", "kebab-case"],
    "correctAnswer": "snake_case",
    "timeLimit": 15
  },
  {
    "id": "3",
    "type": "mcq",
    "question": "What does the input() function always return in Python?",
    "options": ["Integer", "Float", "String", "Boolean"],
    "correctAnswer": "String",
    "timeLimit": 20
  },
  {
    "id": "4",
    "type": "mcq",
    "question": "Which operator is used for comparison in Python?",
    "options": ["=", "==", "===", "!="],
    "correctAnswer": "==",
    "timeLimit": 15
  },
  {
    "id": "5",
    "type": "mcq",
    "question": "What is a common cause of an infinite loop in Python?",
    "options": [
      "Using the wrong import statement",
      "Forgetting to update the loop variable",
      "Using too many print statements",
      "Using == instead of ="
    ],
    "correctAnswer": "Forgetting to update the loop variable",
    "timeLimit": 25
  },
  {
    "id": "6",
    "type": "mcq",
    "question": "What happens if you forget the colon (:) in an if statement?",
    "options": ["The code runs normally", "A SyntaxError occurs", "The code runs but gives wrong output", "A RuntimeError occurs"],
    "correctAnswer": "A SyntaxError occurs",
    "timeLimit": 25
  },
  {
    "id": "7",
    "type": "mcq",
    "question": "What is the main purpose of input validation in programming?",
    "options": ["To make code run faster", "To prevent crashes and security issues", "To reduce memory usage", "To improve user interface"],
    "correctAnswer": "To prevent crashes and security issues",
    "timeLimit": 25
  },
  {
    "id": "8",
    "type": "mcq",
    "question": "What is the correct way to handle exceptions in Python?",
    "options": ["try/catch", "try/except", "catch/finally", "handle/error"],
    "correctAnswer": "try/except",
    "timeLimit": 20
  },
  {
    "id": "9",
    "type": "mcq",
    "question": "Which of the following is a good variable name in Python?",
    "options": ["t", "temperature_celsius", "TemperatureCelsius", "TEMP"],
    "correctAnswer": "temperature_celsius",
    "timeLimit": 25
  },
  {
    "id": "10",
    "type": "text",
    "question": "What keyword is used to access global variables inside a function?",
    "correctAnswer": "global",
    "timeLimit": 20
  },
  {
    "id": "11",
    "type": "mcq",
    "question": "What is the correct way to iterate through a list in Python?",
    "options": ["for i in range(list):", "for item in list:", "for i = 0; i < len(list); i++:", "foreach item in list:"],
    "correctAnswer": "for item in list:",
    "timeLimit": 25
  },
  {
    "id": "12",
    "type": "mcq",
    "question": "Which control flow structure is used for decision making in Python?",
    "options": ["for", "while", "if/elif/else", "switch"],
    "correctAnswer": "if/elif/else",
    "timeLimit": 20
  },
  {
    "id": "13",
    "type": "mcq",
    "question": "Which of the following is a mutable data structure in Python?",
    "options": ["String", "Tuple", "List", "Integer"],
    "correctAnswer": "List",
    "timeLimit": 20
  },
  {
    "id": "14",
    "type": "mcq",
    "question": "What is wrong with this code: if band = 'SOAD': print('Wake up!')",
    "options": ["Missing quotes", "Wrong indentation", "Using = instead of ==", "Missing parentheses"],
    "correctAnswer": "Using = instead of ==",
    "timeLimit": 25
  },
  {
    "id": "15",
    "type": "mcq",
    "question": "What is the main advantage of using functions in programming?",
    "options": ["Faster execution", "Less memory usage", "Code reusability", "Better graphics"],
    "correctAnswer": "Code reusability",
    "timeLimit": 20
  },
  {
    "id": "16",
    "type": "text",
    "question": "What exception should you catch when converting string input to integer?",
    "correctAnswer": "ValueError",
    "timeLimit": 25
  },
  {
    "id": "17",
    "type": "mcq",
    "question": "In Python, what determines code blocks instead of curly braces?",
    "options": ["Semicolons", "Indentation", "Parentheses", "Square brackets"],
    "correctAnswer": "Indentation",
    "timeLimit": 20
  },
  {
    "id": "18",
    "type": "mcq",
    "question": "What is the scope of a variable defined inside a function?",
    "options": ["Global", "Local", "Class", "Module"],
    "correctAnswer": "Local",
    "timeLimit": 20
  },
  {
    "id": "19",
    "type": "text",
    "question": "What sorting algorithm is mentioned as a simple example for beginners?",
    "correctAnswer": "bubble sort",
    "timeLimit": 20
  },
  {
    "id": "20",
    "type": "mcq",
    "question": "Which C function is safer to prevent buffer overflow when reading strings?",
    "options": ["scanf()", "gets()", "fgets()", "strcpy()"],
    "correctAnswer": "fgets()",
    "timeLimit": 25
  }
]


export const API_KEY = process.env.QUIZ_API_KEY || "quiz-api-key-2024-secure"
