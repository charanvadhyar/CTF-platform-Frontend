"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getChallenge, submitChallenge } from "@/lib/api"
import ChallengeLayout from "@/components/ChallengeLayout"
import { ArrowLeft, Flag, CheckCircle, XCircle } from "lucide-react"
import { useUser } from "@/lib/userContext"

export default function SubmitChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { user, setUser, refreshUser } = useUser();
  const challengeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [flag, setFlag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [challenge, setChallenge] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!challengeId) {
        setError("Invalid challenge ID");
        setLoading(false);
        return;
      }
      
      try {
        // First try to fetch by ID directly
        try {
          const response = await getChallenge(challengeId as string);
          setChallenge(response);
          return;
        } catch (idError) {
          // If challenge not found, show error
          setError("Challenge not found");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Check if challenge exists
    if (!challenge) {
      setResult({ success: false, message: "Challenge not found" });
      setIsSubmitting(false);
      return;
    }

    try {
      // Use the API client method for submitting flags - properly format submission data
      const response = await submitChallenge(challengeId as string, { 
        submission_type: "flag", 
        flag: flag.trim() 
      });
      
      setResult({
        success: response.success,
        message: response.message
      });

      if (response.success) {
        // Refresh user data to update solved challenges
        try {
          await refreshUser();
          console.log("User data refreshed after successful submission");
        } catch (refreshError) {
          console.error("Failed to refresh user data:", refreshError);
        }
        
        setTimeout(() => {
          router.push("/challenges")
        }, 2000)
      }
    } catch (error) {
      console.error("Error submitting flag:", error);
      setResult({ success: false, message: "Error submitting flag. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ChallengeLayout>
        <div className="max-w-2xl mx-auto p-6">Loading challenge...</div>
      </ChallengeLayout>
    );
  }
  
  if (error || !challenge) {
    return (
      <ChallengeLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-red-500">{error || "Challenge not found"}</div>
          <div className="mt-4">
            <Link href="/challenges">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Challenges
              </Button>
            </Link>
          </div>
        </div>
      </ChallengeLayout>
    );
  }
  
  return (
    <ChallengeLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/challenges">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{challenge.title} - Submit</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Flag className="h-5 w-5" />
              <span>Submit Your Flag</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="flag" className="block text-sm font-medium text-gray-700 mb-2">
                  Flag (format: CTF{"{"}...{"}"})
                </label>
                <Input
                  id="flag"
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="CTF{your_flag_here}"
                  required
                  className="font-mono"
                />
              </div>

              <Button type="submit" disabled={isSubmitting || !flag.trim()} className="w-full">
                {isSubmitting ? "Submitting..." : "Submit Flag"}
              </Button>
            </form>

            {result && (
              <div
                className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
                  result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {result.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                <span>{result.message}</span>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Challenge Info:</h3>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Points:</strong> {challenge.points}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Difficulty:</strong> {challenge.difficulty}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Category:</strong> {challenge.category}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  )
}
