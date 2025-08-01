"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy, Medal, Award, Crown, Search, Filter, Eye, EyeOff, Star, Target } from "lucide-react"
import { getLeaderboard, getUserProgress, type User, type LeaderboardEntry } from "@/lib/api"

interface LeaderboardUser {
  id: string
  username: string
  email: string
  completedChallenges: number
  completionPercentage: number
  totalScore: number
  rank: number
  createdAt: string
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<LeaderboardUser[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("totalScore")
  // Email visibility removed as per security requirements
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboardData()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, sortBy])

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch leaderboard data from FastAPI backend
      const leaderboardData = await getLeaderboard(50)
      
      if (leaderboardData && leaderboardData.leaderboard) {
        // Map API response to the format our component expects
        const leaderboardUsers: LeaderboardUser[] = leaderboardData.leaderboard.map(entry => ({
          id: entry.username, // Using username as ID since that's what we display
          username: entry.username,
          email: `${entry.username}@example.com`, // Email is not provided by API, using placeholder
          totalScore: entry.score,
          completedChallenges: entry.solved_challenges,
          completionPercentage: entry.progress_percentage,
          rank: entry.rank,
          createdAt: new Date().toISOString(), // Date not provided by API, using current date
        }))

        setUsers(leaderboardUsers)
      }
    } catch (error) {
      console.error("Error fetching leaderboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortUsers = () => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Sort users based on selected criteria
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "totalScore":
          return b.totalScore - a.totalScore
        case "completedChallenges":
          return b.completedChallenges - a.completedChallenges
        case "completionPercentage":
          return b.completionPercentage - a.completionPercentage
        case "username":
          return a.username.localeCompare(b.username)
        case "joinDate":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return b.totalScore - a.totalScore
      }
    })

    // Update ranks after filtering and sorting
    filtered.forEach((user, index) => {
      user.rank = index + 1
    })

    setFilteredUsers(filtered)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />
      default:
        return <Trophy className="h-5 w-5 text-gray-300" />
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">🥇 1st</Badge>
      case 2:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">🥈 2nd</Badge>
      case 3:
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">🥉 3rd</Badge>
      default:
        return <Badge variant="outline">#{rank}</Badge>
    }
  }

  const blurEmail = (email: string) => {
    const [username, domain] = email.split("@")
    const blurredUsername = username.charAt(0) + "*".repeat(username.length - 2) + username.charAt(username.length - 1)
    const [domainName, extension] = domain.split(".")
    const blurredDomain =
      domainName.charAt(0) + "*".repeat(Math.max(0, domainName.length - 2)) + domainName.charAt(domainName.length - 1)
    return `${blurredUsername}@${blurredDomain}.${extension}`
  }

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50"
    if (percentage >= 50) return "text-yellow-600 bg-yellow-50"
    if (percentage >= 25) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
            <Trophy className="h-10 w-10 text-yellow-500" />
            <span>Leaderboard</span>
          </h1>
          <p className="text-xl text-gray-600">See how you rank against other CTF players</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Top Score</p>
                  <p className="text-2xl font-bold">{users[0]?.totalScore || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Avg. Completion</p>
                  <p className="text-2xl font-bold">
                    {users.length > 0
                      ? Math.round(users.reduce((sum, user) => sum + user.completionPercentage, 0) / users.length)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Perfect Scores</p>
                  <p className="text-2xl font-bold">
                    {users.filter((user) => user.completionPercentage === 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="totalScore">Total Score</SelectItem>
                    <SelectItem value="completedChallenges">Completed Challenges</SelectItem>
                    <SelectItem value="completionPercentage">Completion %</SelectItem>
                    <SelectItem value="username">Username (A-Z)</SelectItem>
                    <SelectItem value="joinDate">Join Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email display controls removed as per security requirements */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400">
                  {searchTerm ? "Try adjusting your search terms" : "Be the first to solve a challenge!"}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Rank</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Player</th>
                      <th className="text-left py-3 px-2 font-semibold text-gray-700">Email</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Score</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Completed</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Progress</th>
                      <th className="text-center py-3 px-2 font-semibold text-gray-700">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          user.rank <= 3 ? "bg-gradient-to-r from-blue-50/50 to-purple-50/50" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(user.rank)}
                            {getRankBadge(user.rank)}
                          </div>
                        </td>

                        {/* Player */}
                        <td className="py-4 px-2">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 rounded-full p-2">
                              <span className="text-blue-600 font-semibold text-sm">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user.username}</p>
                              {user.completionPercentage === 100 && (
                                <Badge className="bg-green-100 text-green-800 text-xs mt-1">🏆 Champion</Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email - Always protected */}
                        <td className="py-4 px-2">
                          <span className="text-sm text-gray-600 font-mono">
                            {blurEmail(user.email)}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold text-blue-600">{user.totalScore}</span>
                          </div>
                        </td>

                        {/* Completed */}
                        <td className="py-4 px-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Trophy className="h-4 w-4 text-green-500" />
                            <span className="font-semibold">{user.completedChallenges}/15</span>
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="py-4 px-2 text-center">
                          <div className="flex flex-col items-center space-y-1">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${user.completionPercentage}%` }}
                              ></div>
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${getCompletionColor(user.completionPercentage)}`}
                            >
                              {user.completionPercentage}%
                            </span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="py-4 px-2 text-center">
                          <span className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top 3 Highlight */}
        {filteredUsers.length >= 3 && !searchTerm && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">🏆 Top 3 Champions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {filteredUsers.slice(0, 3).map((user, index) => (
                <Card key={user.id} className={`text-center ${index === 0 ? "ring-2 ring-yellow-300" : ""}`}>
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">{getRankIcon(user.rank)}</div>
                    <h3 className="text-xl font-bold mb-2">{user.username}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <Star className="h-5 w-5" />
                        <span className="text-2xl font-bold">{user.totalScore}</span>
                      </div>
                      <p className="text-gray-600">{user.completedChallenges}/15 challenges</p>
                      <Badge className={getDifficultyColor(user.completionPercentage)}>
                        {user.completionPercentage}% complete
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const getDifficultyColor = (percentage: number) => {
  if (percentage >= 80) return "bg-green-100 text-green-800"
  if (percentage >= 50) return "bg-yellow-100 text-yellow-800"
  if (percentage >= 25) return "bg-orange-100 text-orange-800"
  return "bg-red-100 text-red-800"
}
