"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Target, Trophy, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/lib/userContext"

export default function HomePage() {
  const { register } = useUser()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Use the register function from user context (calls FastAPI backend)
      await register(email, username)
      
      // Route to challenges after successful registration
      router.push("/challenges")
    } catch (error: any) {
      setError(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 w-full">
      <div className="py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Shield className="h-20 w-20 text-blue-400 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-white mb-4">CTF Challenge Platform</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Test your cybersecurity skills with our collection of Capture The Flag challenges. From web exploitation to
            cryptography, we have something for everyone.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Sign Up Form */}
          <div className="order-2 lg:order-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-3xl mb-2">Get Started</CardTitle>
                <CardDescription className="text-gray-300 text-lg">
                  Enter your details to begin your CTF journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 bg-transparent">
                  <div>
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="border-white/20 placeholder-gray-400 h-12 text-lg text-black"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border-white/20 placeholder-gray-400 h-12 text-lg text-black"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-md">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !username.trim() || !email.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <span>Creating Account...</span>
                    ) : (
                      <>
                        <span>Start Challenges</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm">No password required • Start solving immediately</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="flex items-start space-x-4 text-white">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <Target className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">15 Unique Challenges</h3>
                <p className="text-gray-300">
                  Web exploitation, cryptography, binary analysis, and forensics challenges designed to test your skills
                  across multiple domains.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Competitive Leaderboard</h3>
                <p className="text-gray-300">
                  Compete with other players, earn points for each solved challenge, and climb to the top of the
                  leaderboard.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 text-white">
              <div className="bg-green-500/20 p-3 rounded-lg">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
                <p className="text-gray-300">
                  Monitor your solving progress, see which challenges you've completed, and track your total score.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-white">
              <div className="text-3xl font-bold text-blue-400 mb-2">15</div>
              <div className="text-gray-300">Challenges</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold text-yellow-400 mb-2">4</div>
              <div className="text-gray-300">Categories</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
              <div className="text-gray-300">Learning</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300">Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
