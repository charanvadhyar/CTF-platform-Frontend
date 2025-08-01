"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAllChallenges } from "@/lib/db"
import { Challenge, User } from "@/lib/api"
import { UserProgress } from "@/lib/types"
import { CheckCircle, XCircle, Star, User as UserIcon, Trophy, ArrowRight, Target } from "lucide-react"
import { useUser } from "@/lib/userContext"

export default function ChallengesPage() {
  const { user, loading: userLoading } = useUser()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Separate fetchChallenges function definition for clarity
  const fetchChallenges = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Import API client functions
      const { getChallenges } = await import('@/lib/api')
      
      // Use the API client with JWT token
      const challengesData = await getChallenges()
      setChallenges(challengesData)
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
      setError('Failed to load challenges. Please try again later.')
      setChallenges([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for user context to be loaded before fetching challenges
    if (userLoading) return;
    
    // Call fetchChallenges once user context is loaded
    fetchChallenges()

    // Fetch user progress if user is logged in
    if (user?.id) {
      fetch(`/api/progress?userId=${user.id}`)
        .then((res) => res.json())
        .then(setUserProgress)
        .catch(() => setUserProgress([]))
    }
  }, [user])

  const isCompleted = (challengeId: string) => {
    // Check if challenge is in user's solved_challenges list
    return user?.solved_challenges?.includes(challengeId) || false
  }

  const completedCount = user?.solved_challenges?.length || 0
  const totalPoints = user?.score || 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Web":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Crypto":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Binary":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Forensics":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "Mixed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Loading challenges...</h1>
          <p className="text-gray-600">Please wait while we prepare the CTF challenges for you.</p>
        </div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2 text-red-600">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  // No challenges state
  if (!challenges.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">No challenges available</h1>
          <p className="text-gray-600">Check back later for new challenges or contact an administrator.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <UserIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Welcome back, {user.username}!</h2>
                    <p className="text-gray-600">
                      Ready to tackle some challenges? Pick up where you left off or try something new.
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-blue-600 mb-1">
                      <Trophy className="h-5 w-5" />
                      <span className="font-bold text-lg">{totalPoints}</span>
                    </div>
                    <p className="text-sm text-gray-500">Total Points</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-green-600 mb-1">
                      <Target className="h-5 w-5" />
                      <span className="font-bold text-lg">{completedCount}</span>
                    </div>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">CTF Challenges</h1>
          <p className="text-xl text-gray-600 mb-2">Test your cybersecurity skills across 15 unique challenges</p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Completed</span>
            </span>
            <span className="flex items-center space-x-1">
              <XCircle className="h-4 w-4 text-gray-400" />
              <span>Not Started</span>
            </span>
          </div>
        </div>

        {/* Challenges Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {challenges.map((challenge) => {
            const completed = isCompleted(challenge.id)
            return (
              <Card
                key={challenge.id}
                className={`hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${
                  completed ? "ring-2 ring-green-200 bg-green-50/50" : ""
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      {completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-500">#{challenge.id}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-500">
                      <Star className="h-4 w-4" />
                      <span className="text-sm font-medium">{challenge.points}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{challenge.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{challenge.description}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-4">
                    <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </Badge>
                    <Badge className={`text-xs ${getCategoryColor(challenge.category)}`}>{challenge.category}</Badge>
                  </div>

                  <Link href={`/challenges/${challenge.id}/intro`}>
                    <Button
                      className={`w-full flex items-center justify-center space-x-2 ${
                        completed ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      <span>{completed ? "Review Challenge" : "Start Challenge"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Your Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Challenges Completed:</span>
                  <span className="font-bold text-lg">{completedCount}/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(completedCount / 15) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Points:</span>
                  <span className="font-bold text-lg text-blue-600">{totalPoints}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
