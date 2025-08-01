"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ChallengeLayout from "@/components/ChallengeLayout"
import { ArrowLeft, Flag } from "lucide-react"
import { Challenge, getChallenge } from "@/lib/api"
import { getChallengeBySlug } from "@/lib/db"
import ReactMarkdown from 'react-markdown';

export default function PlayChallengePage() {
  const params = useParams();
  const challengeId = params.id as string;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        // First try to fetch by ID directly
        try {
          const response = await getChallenge(challengeId);
          console.log("Play page - Challenge data from API:", response);
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

  return (
    <ChallengeLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Link href="/challenges">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Challenges
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{challenge.title} - Play</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Challenge Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            {challenge.play_instructions ? (
              <div className="prose prose-stone dark:prose-invert max-w-none">
                <ReactMarkdown>{challenge.play_instructions}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-gray-500">No play instructions available for this challenge.</div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href={`/challenges/${challenge.id}/submit`}>
            <Button className="flex items-center space-x-2">
              <Flag className="h-4 w-4" />
              <span>Submit Your Flag</span>
            </Button>
          </Link>
        </div>
      </div>
    </ChallengeLayout>
  )
}
