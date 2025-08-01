"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Send, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Reflected XSS Challenge

You've been given access to a commenting system for a simple blog. Your task is to identify and exploit a Cross-Site Scripting (XSS) vulnerability to steal the admin's cookie.

### Hints:
- The site doesn't properly sanitize user input before displaying it
- Look for ways to inject and execute JavaScript code
- The admin's cookie contains the flag
- Try submitting HTML tags or JavaScript in your comment
`;

// Flag for this challenge (same as in backend)
const FLAG = "CTF{reflected_xss_cookie_theft}";

// Simulated admin cookie that contains the flag
const ADMIN_COOKIE = `admin=true; flag=${FLAG}; sessionId=938a77b4c98d0965`;

export default function ReflectedXssChallenge() {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Array<{name: string, comment: string}>>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [foundFlag, setFoundFlag] = useState(false);
  
  // Simulate document.cookie for the admin
  const simulateAdminView = (commentHtml: string) => {
    try {
      // This is a simulated environment to check if the XSS attack would work
      // In a real browser, this would execute the script in the context of the admin's session
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = commentHtml;
      
      // Find script tags
      const scripts = tempDiv.getElementsByTagName('script');
      if (scripts.length > 0) {
        // Simulate the execution of script in admin context
        const scriptContent = scripts[0].textContent || scripts[0].innerText;
        if (scriptContent && scriptContent.includes('document.cookie')) {
          // The script is trying to access cookies, which means it could be successful
          // Check if there's a way for the data to be exfiltrated
          if (
            scriptContent.includes('fetch') || 
            scriptContent.includes('XMLHttpRequest') ||
            scriptContent.includes('navigator.sendBeacon') ||
            scriptContent.includes('Image') ||
            scriptContent.includes('$.ajax') ||
            scriptContent.includes('new Image') ||
            scriptContent.includes('src=')
          ) {
            // Simulate a successful cookie theft
            setFoundFlag(true);
            setSuccess(true);
            return true;
          }
        }
      }
      
      // Check for img onerror XSS
      const images = tempDiv.getElementsByTagName('img');
      for (let i = 0; i < images.length; i++) {
        const onErrorAttr = images[i].getAttribute('onerror');
        if (onErrorAttr && (
          onErrorAttr.includes('document.cookie') || 
          onErrorAttr.includes('alert') ||
          onErrorAttr.includes('console.log')
        )) {
          // Simulate a successful cookie theft via img onerror
          setFoundFlag(true);
          setSuccess(true);
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error("Error in admin simulation:", err);
      return false;
    }
  };
  
  const handleSubmitComment = () => {
    setError("");
    
    if (!name.trim() || !comment.trim()) {
      setError("Name and comment are required");
      return;
    }
    
    // Dangerously render user input without sanitization (intentionally vulnerable)
    const newComment = { name, comment };
    setComments([...comments, newComment]);
    
    // Reset form
    setName("");
    setComment("");
    
    // Simulate admin viewing the page with their cookies
    simulateAdminView(`<div>${newComment.comment}</div>`);
  };
  
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
          <h1 className="text-2xl font-bold">Reflected XSS Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Challenge Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-stone dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: CHALLENGE_DESCRIPTION.replace(/\n/g, '<br />') }} />
            </div>
          </CardContent>
        </Card>
        
        {foundFlag && (
          <Card className="mb-6 border-green-500">
            <CardHeader className="bg-green-50 text-green-700">
              <CardTitle>Success! You've found the flag!</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-700">XSS Attack Successful!</AlertTitle>
                <AlertDescription className="text-green-600">
                  <p>You successfully stole the admin's cookie:</p>
                  <pre className="mt-2 p-2 bg-black text-white font-mono text-xs rounded">
                    {ADMIN_COOKIE}
                  </pre>
                  <p className="mt-2">The flag is: <strong>{FLAG}</strong></p>
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Link href={`/challenges/3/submit`}>
                <Button className="flex items-center space-x-2">
                  <Flag className="h-4 w-4 mr-2" />
                  <span>Submit Your Flag</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Blog Comment System</CardTitle>
            <CardDescription>
              Leave a comment on our blog post
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-700">Error</AlertTitle>
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Your Comment</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter your comment"
                  rows={4}
                />
              </div>
              
              <Button 
                type="button" 
                onClick={handleSubmitComment}
                className="flex items-center"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {comments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((c, i) => (
                  <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="font-medium">{c.name}</div>
                    {/* Intentionally vulnerable to XSS */}
                    <div dangerouslySetInnerHTML={{ __html: c.comment }} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Administrator Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border rounded bg-slate-50">
              <h3 className="text-lg font-medium mb-4">Internal Information</h3>
              <p className="mb-2 text-sm text-gray-600">
                <strong>Note:</strong> Admin reviews all comments periodically while logged in.
              </p>
              <div className="p-2 bg-gray-100 text-xs font-mono rounded">
                <p><strong>// Dev notes</strong></p>
                <p>Admin cookies contain sensitive data including the flag.</p>
                <p>Ensure proper input sanitization before production.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <Link href={`/challenges/3/submit`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Flag className="h-4 w-4 mr-2" />
              <span>Submit Your Flag</span>
            </Button>
          </Link>
        </div>
      </div>
    </ChallengeLayout>
  );
}
