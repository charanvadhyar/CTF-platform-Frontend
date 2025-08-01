"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { User, UserProgress } from "@/lib/types"
import { users, userProgress } from "@/lib/db"

export default function AdminUsersPage() {
  const [usersData, setUsersData] = useState<User[]>([])
  const [progressData, setProgressData] = useState<UserProgress[]>([])

  useEffect(() => {
    setUsersData([...users])
    setProgressData([...userProgress])
  }, [])

  const getUserCompletedChallenges = (userId: string) => {
    return progressData.filter((p) => p.userId === userId && p.completed).length
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">User Management</h1>
          <p className="text-xl text-gray-600">View and manage user progress</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersData.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No users registered yet.</p>
            ) : (
              <div className="space-y-4">
                {usersData.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{user.totalScore} pts</p>
                        <p className="text-sm text-gray-500">{getUserCompletedChallenges(user.id)}/15 challenges</p>
                      </div>
                      <Badge variant="outline">
                        {getUserCompletedChallenges(user.id) === 15 ? "Complete" : "Active"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
