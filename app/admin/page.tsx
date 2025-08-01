"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Users, Trophy, Settings, Target, Edit, Save, X, BarChart3, Monitor, Smartphone } from "lucide-react"
import type { User as FrontendUser, UserProgress, Challenge as FrontendChallenge, AdSlot } from "@/lib/types"
import { getAdminUsers, getLeaderboard, getAdminChallenges, getAdminAds, updateAdminChallenge, updateAdminAd, createAdminAd } from "@/lib/api"

// Define interface types that match backend responses
interface BackendUser {
  id: string;
  username: string;
  email: string;
  role: string;
  score: number;
  totalScore?: number; // For frontend compatibility
  createdAt?: Date; // For frontend compatibility
  solved_challenges: string[];
  created_at?: string;
  last_login?: string;
}

interface BackendChallenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
  category: string;
  is_active: boolean;
  flag?: string; // For frontend compatibility
  frontend_hint?: string;
  frontend_config?: Record<string, any>;
  backend_config?: Record<string, any>;
  solve_count?: number;
  play_instructions?: string;
  intro?: string;
}

interface BackendAd {
  position: string;
  content: string;
  ad_id: string;
  id?: string; // For frontend compatibility
  code?: string; // For frontend compatibility
  active?: boolean; // For frontend compatibility
}

interface LeaderboardItem {
  rank: number;
  username: string;
  score: number;
  solved_challenges: number;
  progress_percentage: number;
  is_current_user: boolean;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [userProgress, setUserProgress] = useState<LeaderboardItem[]>([])
  const [challenges, setChallenges] = useState<BackendChallenge[]>([])
  const [adSlots, setAdSlots] = useState<BackendAd[]>([])
  const [editingChallenge, setEditingChallenge] = useState<string | null>(null)
  const [editingAd, setEditingAd] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChallenges: 0,
    completedChallenges: 0,
    activeAds: 0,
  })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Use API client methods which automatically use the token from localStorage
      const [usersData, progressResponse, challengesData, adsData] = await Promise.all([
        getAdminUsers(),
        getLeaderboard(),
        getAdminChallenges(),
        getAdminAds(),
      ])

      // Get leaderboard data
      const progressData = Array.isArray(progressResponse.leaderboard) ? progressResponse.leaderboard : []

      // Set state with the stored data
      setUsers(Array.isArray(usersData) ? usersData : [])
      setUserProgress(progressData)
      setChallenges(Array.isArray(challengesData) ? challengesData : [])
      
      // Ensure adSlots is always an array and add missing fields
      const safeAdsData = Array.isArray(adsData) ? adsData : []
      
      // Debug raw ads data
      console.log('Raw ads data:', adsData)
      
      // Create default ad slots if none returned from API
      if (safeAdsData.length === 0) {
        console.log('No ads found, creating default ad slots')
        // Add default ad slots for common positions
        const defaultAds = [
          {
            position: 'top',
            content: '<!-- Top banner ad code here -->',
            ad_id: 'default-top',
            id: 'default-top',
            code: '<!-- Top banner ad code here -->',
            active: false
          },
          {
            position: 'sidebar',
            content: '<!-- Sidebar ad code here -->',
            ad_id: 'default-sidebar',
            id: 'default-sidebar',
            code: '<!-- Sidebar ad code here -->',
            active: false
          },
          {
            position: 'bottom',
            content: '<!-- Bottom banner ad code here -->',
            ad_id: 'default-bottom',
            id: 'default-bottom',
            code: '<!-- Bottom banner ad code here -->',
            active: false
          }
        ]
        setAdSlots(defaultAds)
        
        // Calculate stats even when using default ads
        setStats({
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
          totalChallenges: 15,
          completedChallenges: progressData.filter(p => p.solved_challenges > 0).length,
          activeAds: 0, // No active ads when using defaults
        })
        
        return // Skip further ad processing
      }
      
      // Transform the ads data to include the expected fields
      const processedAdsData = safeAdsData.map(ad => {
        const processedAd = {
          ...ad,
          id: ad.ad_id,  // Ensure id exists from ad_id
          code: ad.content || '', // Use content as the initial code
          active: true, // Default to active
        }
        console.log('Processed ad:', processedAd)
        return processedAd
      })
      
      console.log('Setting ad slots:', processedAdsData)
      setAdSlots(processedAdsData)

      // Calculate stats using the same data
      setStats({
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
        totalChallenges: 15,
        completedChallenges: progressData.filter(p => p.solved_challenges > 0).length,
        activeAds: Array.isArray(adsData) ? adsData.length : 0,
      })
    } catch (error) {
      console.error("Error fetching admin data:", error)
    }
  }

  const getUserCompletedCount = (userId: string) => {
    // Find user in the users array and return their solved challenges count
    const user = users.find((u) => u.id === userId)
    return user ? user.solved_challenges?.length || 0 : 0
  }

  const handleSaveChallenge = async (challenge: BackendChallenge) => {
    try {
      const updatedChallenge = await updateAdminChallenge(challenge.id, challenge)
      setChallenges((prev) => prev.map((c) => (c.id === challenge.id ? updatedChallenge : c)))
      setEditingChallenge(null)
    } catch (error) {
      console.error("Error saving challenge:", error)
    }
  }

  const handleSaveAd = async (adSlot: BackendAd) => {
    try {
      const adId = adSlot.ad_id || adSlot.id as string
      let responseMessage: { message: string }
      
      // Check if this is a default ad that needs to be created first
      const isDefaultAd = adId.startsWith('default-')
      
      if (isDefaultAd) {
        console.log('Creating new ad:', adSlot)
        // For default ads or new ads, use createAdminAd
        // Always prioritize the code from the UI (what user entered in textarea)
        responseMessage = await createAdminAd({
          position: adSlot.position,
          content: adSlot.code, // Always use code from the admin UI
        })
      } else {
        console.log('Updating existing ad:', adSlot)
        // For existing ads, use updateAdminAd with the code from the UI
        const updateData = {
          position: adSlot.position,
          content: adSlot.code, // Always use code from admin UI
          is_active: adSlot.active
        }
        console.log('Sending update with data:', updateData)
        responseMessage = await updateAdminAd(adId, updateData)
      }
      
      console.log('API response:', responseMessage)
      
      // Since API returns { message: string }, we'll return the original adSlot with the updated ID
      // This maintains type compatibility with BackendAd
      const typedUpdatedAd: BackendAd = {
        position: adSlot.position,
        content: adSlot.content, 
        ad_id: adId,
        id: adId,
        code: adSlot.code,
        active: adSlot.active
      }
      
      setAdSlots((prev) => prev.map((ad) => {
        const currentAdId = ad.ad_id || ad.id as string
        const updatedAdId = typedUpdatedAd.ad_id || typedUpdatedAd.id as string
        return currentAdId === updatedAdId ? typedUpdatedAd : ad
      }))
      setEditingAd(null)
      // Update localStorage for immediate effect
      localStorage.setItem("adConfig", JSON.stringify(adSlots))
    } catch (error) {
      console.error("Error saving ad:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered players</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Challenges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
            <p className="text-xs text-muted-foreground">Available challenges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedChallenges}</div>
            <p className="text-xs text-muted-foreground">Total solved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAds}</div>
            <p className="text-xs text-muted-foreground">Ad slots enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Ads</span>
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>CTFs</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Registered Users</CardTitle>
              <CardDescription>View and manage user accounts and their progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Username</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-center py-2">Score</th>
                      <th className="text-center py-2">Completed</th>
                      <th className="text-center py-2">Progress</th>
                      <th className="text-center py-2">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const completed = getUserCompletedCount(user.id)
                      const percentage = Math.round((completed / 15) * 100)
                      return (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 font-medium">{user.username}</td>
                          <td className="py-3 text-gray-600">{user.email}</td>
                          <td className="py-3 text-center font-bold text-blue-600">{user.totalScore}</td>
                          <td className="py-3 text-center">{completed}/15</td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="text-sm">{percentage}%</span>
                            </div>
                          </td>
                          <td className="py-3 text-center text-sm text-gray-500">
                            <div>{user.created_at ? new Date(String(user.created_at)).toLocaleDateString() : 'N/A'}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Top Scorers</CardTitle>
              <CardDescription>Current leaderboard rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .slice(0, 10)
                  .map((user, index) => {
                    const completed = getUserCompletedCount(user.id)
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                  ? "bg-gray-400 text-white"
                                  : index === 2
                                    ? "bg-orange-500 text-white"
                                    : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold">{user.username}</p>
                            <p className="text-sm text-gray-600">{completed}/15 challenges</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{user.totalScore}</p>
                          <p className="text-sm text-gray-500">points</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ads Tab */}
        <TabsContent value="ads">
          <div className="grid md:grid-cols-2 gap-6">
            {adSlots.map((ad) => (
              <Card key={ad.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize flex items-center space-x-2">
                      {ad.position === "top" || ad.position === "bottom" ? (
                        <Monitor className="h-5 w-5" />
                      ) : (
                        <Smartphone className="h-5 w-5" />
                      )}
                      <span>{ad.position} Ad Slot</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.active}
                        onCheckedChange={(checked) => {
                          const updatedAd = { ...ad, active: checked }
                          handleSaveAd(updatedAd)
                        }}
                      />
                      <Badge variant={ad.active ? "default" : "secondary"}>{ad.active ? "Active" : "Inactive"}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingAd === ad.id ? (
                    <div className="space-y-4">
                      <Textarea
                        value={ad.code}
                        onChange={(e) =>
                          setAdSlots((prev) => prev.map((a) => (a.id === ad.id ? { ...a, code: e.target.value } : a)))
                        }
                        placeholder="Paste your ad HTML code here..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                      <div className="flex space-x-2">
                        <Button onClick={() => handleSaveAd(ad)} size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingAd(null)} size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-3 rounded text-sm">
                        <p className="text-gray-600 mb-1">Code Length: {ad.code?.length || 0} characters</p>
                        <p className="text-gray-600">Status: {ad.active ? "Active" : "Inactive"}</p>
                      </div>
                      {ad.code && (
                        <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto max-h-32">
                          <pre>{ad.code.substring(0, 200)}...</pre>
                        </div>
                      )}
                      <Button size="sm" onClick={() => setEditingAd(ad.id || null)}> 
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Code
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle>CTF Challenges Management</CardTitle>
              <CardDescription>Edit challenge content, answers, and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Challenge #{challenge.id}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge>{challenge.category}</Badge>
                          <Badge variant="outline">{challenge.difficulty}</Badge>
                          {editingChallenge === challenge.id ? (
                            <div className="flex space-x-2">
                              <Button onClick={() => handleSaveChallenge(challenge)} size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button variant="outline" onClick={() => setEditingChallenge(null)} size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button onClick={() => setEditingChallenge(challenge.id)} variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {editingChallenge === challenge.id ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Title</label>
                              <Input
                                value={challenge.title}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) => (c.id === challenge.id ? { ...c, title: e.target.value } : c)),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Slug</label>
                              <Input
                                value={challenge.slug}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) => (c.id === challenge.id ? { ...c, slug: e.target.value } : c)),
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Description</label>
                              <Textarea
                                value={challenge.description}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) =>
                                      c.id === challenge.id ? { ...c, description: e.target.value } : c,
                                    ),
                                  )
                                }
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Points</label>
                                <Input
                                  type="number"
                                  value={challenge.points}
                                  onChange={(e) =>
                                    setChallenges((prev) =>
                                      prev.map((c) =>
                                        c.id === challenge.id ? { ...c, points: Number.parseInt(e.target.value) } : c,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <Input
                                  value={challenge.category}
                                  onChange={(e) =>
                                    setChallenges((prev) =>
                                      prev.map((c) => (c.id === challenge.id ? { ...c, category: e.target.value } : c)),
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Correct Answer (Flag)</label>
                              <Input
                                value={challenge.flag}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) => (c.id === challenge.id ? { ...c, flag: e.target.value } : c)),
                                  )
                                }
                                className="font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Intro Content</label>
                              <Textarea
                                value={challenge.intro || ""}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) =>
                                      c.id === challenge.id ? { ...c, intro: e.target.value } : c,
                                    ),
                                  )
                                }
                                placeholder="Rich text or markdown content for the intro page..."
                                rows={6}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">Play Instructions</label>
                              <Textarea
                                value={challenge.play_instructions || ""}
                                onChange={(e) =>
                                  setChallenges((prev) =>
                                    prev.map((c) =>
                                      c.id === challenge.id ? { ...c, play_instructions: e.target.value } : c,
                                    ),
                                  )
                                }
                                placeholder="Instructions for the interactive challenge environment..."
                                rows={4}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">{challenge.title}</h4>
                            <p className="text-gray-600 mb-2">{challenge.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Slug: {challenge.slug}</span>
                              <span>Points: {challenge.points}</span>
                            </div>
                          </div>
                          <div>
                            <div className="bg-gray-100 p-3 rounded">
                              <p className="text-sm font-medium mb-1">Correct Answer:</p>
                              <code className="text-sm bg-gray-200 px-2 py-1 rounded">{challenge.flag}</code>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
