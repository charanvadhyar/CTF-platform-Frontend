import type { UserProgress, AdSlot, PageVisit } from "./types"
import { apiClient, User, Challenge } from "./api"

// Real API calls to FastAPI backend - no more mock data!
// All functions now call the actual backend API

// Helper functions that call the real API
export async function getUserById(id: string): Promise<User | undefined> {
  try {
    // Only try to get user if we have a token and we're in the browser
    if (typeof window === 'undefined') {
      return undefined // Server-side, no localStorage access
    }
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return undefined
    }
    return await apiClient.getCurrentUser()
  } catch (error) {
    console.error('Failed to get user:', error)
    return undefined
  }
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  try {
    // Only try to get user if we have a token and we're in the browser
    if (typeof window === 'undefined') {
      return undefined // Server-side, no localStorage access
    }
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return undefined
    }
    // This would need a specific API endpoint for getting user by username
    // For now, just return undefined since we don't have this endpoint
    return undefined
  } catch (error) {
    console.error('Failed to get user by username:', error)
    return undefined
  }
}

export async function getChallengeById(id: string): Promise<Challenge | undefined> {
  try {
    return await apiClient.getChallenge(id)
  } catch (error) {
    console.error('Failed to get challenge:', error)
    return undefined
  }
}

export async function getChallengeBySlug(slug: string): Promise<Challenge | undefined> {
  try {
    // For now, get all challenges and find by slug
    // In production, you'd want a dedicated API endpoint
    const challenges = await apiClient.getChallenges()
    return challenges.find((challenge: Challenge) => challenge.slug === slug)
  } catch (error) {
    console.error('Failed to get challenge by slug:', error)
    return undefined
  }
}

export async function getAllChallenges(): Promise<Challenge[]> {
  try {
    return await apiClient.getChallenges()
  } catch (error) {
    console.error('Failed to get challenges:', error)
    return []
  }
}

export async function getUserProgress(): Promise<any> {
  try {
    return await apiClient.getUserProgress()
  } catch (error) {
    console.error('Failed to get user progress:', error)
    return []
  }
}

export async function getLeaderboard(): Promise<any> {
  try {
    return await apiClient.getLeaderboard()
  } catch (error) {
    console.error('Failed to get leaderboard:', error)
    return { leaderboard: [], total_users: 0 }
  }
}

export async function getAds(position?: string): Promise<any[]> {
  try {
    return await apiClient.getAds(position)
  } catch (error) {
    console.error('Failed to get ads:', error)
    return []
  }
}

// Legacy exports for backward compatibility (now return empty arrays)
export const users: User[] = []
export const challenges: Challenge[] = []
export const userProgress: UserProgress[] = []
export const adSlots: AdSlot[] = []
export const pageVisits: PageVisit[] = []
