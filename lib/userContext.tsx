"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient, User } from './api'

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string) => Promise<void>
  logout: () => void
  loading: boolean
  trackPageView: (path: string) => Promise<void>
  refreshUser: () => Promise<User | null>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }
  
  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
        console.log('User data refreshed:', currentUser)
        return currentUser
      }
      return null
    } catch (error) {
      console.error('User refresh failed:', error)
      return null
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await apiClient.login({ email, password })
      const currentUser = await apiClient.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (email: string, username: string) => {
    try {
      // First register the user
      const user = await apiClient.register({ email, username })
      
      // Then automatically log them in to get the token
      // Backend generates a default password with format: ctf_{username}_{email_prefix}
      try {
        const emailPrefix = email.split('@')[0]
        const generatedPassword = `ctf_${username}_${emailPrefix}`
        
        await apiClient.login({ email, password: generatedPassword })
        // Fetch current user with the new token
        const currentUser = await apiClient.getCurrentUser()
        setUser(currentUser)
      } catch (loginError) {
        console.error('Auto-login after registration failed:', loginError)
        // Still set the user even if auto-login fails
        setUser(user)
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    apiClient.logout()
    setUser(null)
  }

  const trackPageView = async (path: string) => {
    // Temporarily disabled to avoid CORS issues
    // TODO: Fix CORS configuration for analytics endpoint
    console.log('Page tracking disabled:', path)
  }

  return (
    <UserContext.Provider value={{ user, setUser, login, register, logout, loading, trackPageView, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
