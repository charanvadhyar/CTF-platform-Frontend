"use client";

import { useEffect, useState } from "react";
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Challenge, getChallenge } from "@/lib/api"
import { getChallengeBySlug } from "@/lib/db"
import ChallengeLayout from "@/components/ChallengeLayout"
import { Play, Flag, Star, CheckCircle } from "lucide-react"
import { useUser } from "@/lib/userContext"

export default function ChallengePage() {
  const params = useParams();
  const challengeId = params.id as string;
  const { user } = useUser();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the challenge has been solved by the user
  const isChallengeSolved = user?.solved_challenges?.includes(challengeId) || false;
  
  // Debug logs
  useEffect(() => {
    if (user) {
      console.log("User data in challenge page:", user);
      console.log("Current challenge ID:", challengeId);
      console.log("User solved challenges:", user.solved_challenges);
      console.log("Is challenge solved?", isChallengeSolved);
    }
  }, [user, challengeId, isChallengeSolved]);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        // First try to fetch by ID directly
        try {
          const response = await getChallenge(challengeId);
          setChallenge(response);
          return;
        } catch (idError) {
          // If ID fetch fails, try to fetch by slug
          console.log("Failed to fetch by ID, trying slug...");
          const challengeBySlug = await getChallengeBySlug(challengeId);
          
          if (challengeBySlug) {
            // If found by slug, fetch the complete challenge data by ID
            const completeChallenge = await getChallenge(challengeBySlug.id);
            setChallenge(completeChallenge);
            return;
          }
          
          // If both methods fail, throw an error
          throw new Error("Challenge not found");
        }
      } catch (err) {
        console.error("Failed to fetch challenge:", err);
        setError("Failed to load challenge. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading challenge...</div>;
  }

  if (error || !challenge) {
    return <div className="text-red-500 p-8">{error || "Challenge not found"}</div>;
  }

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return "bg-gray-100 text-gray-800";
    
    switch (category) {
      case "Web":
        return "bg-blue-100 text-blue-800"
      case "Crypto":
        return "bg-purple-100 text-purple-800"
      case "Binary":
        return "bg-orange-100 text-orange-800"
      case "Forensics":
        return "bg-pink-100 text-pink-800"
      case "Mixed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ChallengeLayout>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{challenge.title}</CardTitle>
                <CardDescription className="text-lg">{challenge.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-1 text-yellow-500">
                <Star className="h-6 w-6" />
                <span className="text-xl font-bold">{challenge.points}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-6">
              <Badge className={getDifficultyColor(challenge.difficulty)}>{challenge.difficulty}</Badge>
              <Badge className={getCategoryColor(challenge.category)}>{challenge.category}</Badge>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-3">Challenge Instructions</h3>
              <p className="text-gray-700 mb-4">
                Welcome to the "{challenge.title}" challenge! This is a {challenge.difficulty ? challenge.difficulty.toLowerCase() : 'unknown'} level {' '}
                {challenge.category ? challenge.category.toLowerCase() : 'unknown'} challenge worth {challenge.points || 0} points.
              </p>
              <p className="text-gray-700">
                Read the challenge description carefully and use your skills to find the hidden flag. The flag format is
                CTF{"{"}...{"}"}.
              </p>
            </div>

            <div className="flex space-x-4">
              {isChallengeSolved ? (
                <div className="bg-green-100 p-4 rounded-lg w-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-700">Challenge Completed!</h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    You've successfully solved this challenge and earned {challenge.points} points.
                  </p>
                  <Link href="/challenges">
                    <Button className="bg-green-600 hover:bg-green-700">
                      View Other Challenges
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <Link href={`/challenges/${challenge.id}/play`}>
                    <Button className="flex items-center space-x-2">
                      <Play className="h-4 w-4" />
                      <span>Start Challenge</span>
                    </Button>
                  </Link>
                  <Link href={`/challenges/${challenge.id}/submit`}>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Flag className="h-4 w-4" />
                      <span>Submit Flag</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  )
}
