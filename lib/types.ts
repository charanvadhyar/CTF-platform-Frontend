export interface User {
  id: string
  username: string
  email: string
  createdAt: Date
  totalScore: number
  score: number
  role: string
  solved_challenges: string[]
  last_login?: Date
}

export interface Challenge {
  id: string
  slug: string
  title: string
  description: string
  intro?: string
  play_instructions?: string
  difficulty: "Easy" | "Medium" | "Hard"
  points: number
  flag: string
  category: string
}

export interface UserProgress {
  userId: string
  challengeId: string
  completed: boolean
  completedAt?: Date
  attempts: number
}

export interface AdSlot {
  id: string
  position: "top" | "bottom" | "left" | "right"
  code: string
  active: boolean
}

export interface PageVisit {
  id: string
  page: string
  email: string
  username: string
  timestamp: Date
  userAgent: string
}
