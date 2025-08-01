"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Admin Panel Discovery Challenge

You've found the website of a company that claims to have "security through obscurity." Your task is to discover and access their hidden admin panel.

### Hints:
- Sometimes developers hide important URLs in client-side code
- Look for common admin panel paths or naming conventions
- Check the page source, network requests, and any clues in the UI
- The admin panel might not be well-protected once discovered
`;

// Flag for this challenge
const FLAG = "CTF{security_through_obscurity_fails}";

// Admin panel paths to try
const ADMIN_PATHS = [
  "/admin", 
  "/administrator", 
  "/adminpanel", 
  "/admin-panel", 
  "/manage", 
  "/management", 
  "/control", 
  "/dashboard", 
  "/cp", 
  "/backend", 
  "/secret-admin-area",  // This is the one that works
  "/webadmin"
];

export default function AdminPanelDiscoveryChallenge() {
  const [currentUrl, setCurrentUrl] = useState("/");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [accessLog, setAccessLog] = useState<string[]>([]);
  
  // Handle URL navigation
  const handleNavigate = (url: string) => {
    setCurrentUrl(url);
    setMessage("");
    setError("");
    
    // Record the attempt in the log
    setAccessLog(prev => [`${new Date().toLocaleTimeString()} - Accessed: ${url}`, ...prev]);
    setAttemptCount(prev => prev + 1);
    
    // Check if the URL is the correct admin panel
    if (url === "/secret-admin-area") {
      setSuccess(true);
      setMessage("You've discovered the secret admin panel!");
    } else if (ADMIN_PATHS.includes(url)) {
      setError("This page doesn't exist. Try another path.");
    } else {
      setMessage("You are browsing the regular website area.");
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setCurrentUrl("/");
    setMessage("");
    setError("");
    setSuccess(false);
    setShowFlag(false);
    setAccessLog([]);
    setAttemptCount(0);
  };
  
  // Handle login to admin panel
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFlag(true);
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
          <h1 className="text-2xl font-bold">Admin Panel Discovery Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Website</CardTitle>
            <CardDescription>
              Current URL: <span className="font-mono">{currentUrl}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Input 
                  type="text" 
                  placeholder="/path" 
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  className="mr-2 w-full"
                />
                <Button onClick={() => handleNavigate(currentUrl)}>
                  <Search className="h-4 w-4 mr-2" />
                  Navigate
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {message && !error && (
                <Alert className="mb-4">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </div>
            
            {success ? (
              <Card className="border-2 border-green-500 mb-4">
                <CardHeader>
                  <CardTitle className="text-green-500 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Admin Panel Discovered
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Congratulations! You've found the hidden admin panel at <code>/secret-admin-area</code>.</p>
                  
                  {!showFlag ? (
                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div>
                        <label className="block mb-1">Username</label>
                        <Input type="text" defaultValue="admin" disabled />
                      </div>
                      <div>
                        <label className="block mb-1">Password</label>
                        <Input type="password" defaultValue="password123" disabled />
                      </div>
                      <Button type="submit">Log In</Button>
                    </form>
                  ) : (
                    <Alert className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>
                        <p>You successfully logged into the admin panel!</p>
                        <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                        <div className="mt-4">
                          <Link href={`/challenges/5/submit`}>
                            <Button className="flex items-center space-x-2">
                              <Flag className="h-4 w-4 mr-2" />
                              <span>Submit Your Flag</span>
                            </Button>
                          </Link>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded">
                  <h3 className="text-lg font-medium mb-2">Welcome to SecureCorp Website</h3>
                  <p>This is a fictional company website used for the CTF challenge.</p>
                  <p className="text-sm text-gray-500 mt-2">Our admin panel is very secure because nobody can find it!</p>
                </div>
                
                {/* A hint in the page source */}
                {/* <!-- Note: Admin panel moved to /secret-admin-area - remember to remove this comment before production --> */}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="access-log">Access Log ({accessLog.length})</TabsTrigger>
            <TabsTrigger value="view-source">View Source</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Try different common admin paths in the URL</li>
                  <li>Look at the page source for any hidden clues</li>
                  <li>Think like a lazy developer - what would be an easy-to-remember admin URL?</li>
                  <li>You've tried {attemptCount} paths so far</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="access-log">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Access Log</h3>
                {accessLog.length > 0 ? (
                  <ul className="text-sm font-mono space-y-1">
                    {accessLog.map((log, i) => (
                      <li key={i} className="border-b pb-1">{log}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No access attempts logged yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="view-source">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Page Source</h3>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] text-sm">
                  <pre className="text-xs"><code>{`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SecureCorp - Home</title>
</head>
<body>
  <!-- Site content -->
  <div class="welcome-section">
    <h1>Welcome to SecureCorp Website</h1>
    <p>This is a fictional company website used for the CTF challenge.</p>
  </div>
  
  <!-- Note: Admin panel moved to /secret-admin-area - remember to remove this comment before production -->
  
  <!-- Footer -->
  <footer>
    <p>© SecureCorp 2025</p>
  </footer>
</body>
</html>
                  `}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                You've made {attemptCount} access attempts.
                {attemptCount > 5 && !success && " Maybe check the page source for hints?"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
