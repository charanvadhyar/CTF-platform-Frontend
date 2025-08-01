"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Challenge } from "@/lib/api";
import ReactMarkdown from 'react-markdown';
import { getChallenge } from "@/lib/api";
import { getChallengeBySlug } from "@/lib/db";

const ChallengeIntroPage = () => {
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
          console.log("Challenge data from API:", response);
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/challenges">
          <Button variant="outline" size="sm" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{challenge.title} - Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Debug info in console */}
          {challenge.intro ? (
            <div className="prose prose-stone dark:prose-invert max-w-none">
              <ReactMarkdown>{challenge.intro}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-gray-500">No introduction content available for this challenge.</div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6">
        <Link href={`/challenges/${challenge.id}/play`}>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Start Challenge
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ChallengeIntroPage;
