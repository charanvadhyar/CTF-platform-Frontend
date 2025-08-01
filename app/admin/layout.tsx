"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, LogOut } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      // Check if user is admin
      fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      }).then(response => {
        if (response.ok) return response.json()
        throw new Error('Authentication failed')
      })
      .then(userData => {
        if (userData.role === 'admin') {
          setIsAuthenticated(true)
        } else {
          // Not an admin user
          setIsAuthenticated(false)
          router.push('/admin/login')
        }
      })
      .catch(() => {
        // Invalid token
        setIsAuthenticated(false)
        router.push('/admin/login')
      })
    } else {
      // No token found
      setIsAuthenticated(false)
      router.push('/admin/login')
    }
    setIsLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Call the backend admin-login endpoint with the admin token
      const response = await fetch('http://localhost:8000/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_token: token }),
      })

      if (response.ok) {
        const data = await response.json()
        // Store the JWT token returned by the backend
        localStorage.setItem("adminJwtToken", data.access_token)
        localStorage.setItem("token", data.access_token) // For API client
        setIsAuthenticated(true)
      } else {
        alert("Invalid admin token")
      }
    } catch (error) {
      console.error('Admin login error:', error)
      alert("Failed to authenticate. Please check your connection.")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminJwtToken")
    localStorage.removeItem("token") // Remove API client token too
    setIsAuthenticated(false)
    setToken("")
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not authenticated, this will be handled in useEffect with redirect to /admin/login

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}
