"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Mail, User, CheckCircle, AlertCircle, Shield, Clock, LockKeyhole, Flag, KeyRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Weak Password Reset Challenge

You've discovered a password reset functionality for a user account system. Your goal is to exploit weaknesses in the password reset mechanism to gain unauthorized access to another user's account.

### Hints:
- Look at how reset tokens are generated
- Try to identify patterns in token generation
- Are the tokens truly random and unpredictable?
- Can you predict or guess future tokens?
`;

// Flag for this challenge
const FLAG = "CTF{pr3d1ct4bl3_t0k3ns_4r3_1ns3cur3}";

// Define User interface
interface User {
  id: number;
  username: string;
  email: string;
  resetToken: string | null;
  isAdmin: boolean;
  hasFlag?: boolean;
}

// Define user database
const USERS: User[] = [
  { id: 1, username: "admin", email: "admin@example.com", resetToken: null, isAdmin: true, hasFlag: true },
  { id: 2, username: "alice", email: "alice@example.com", resetToken: null, isAdmin: false },
  { id: 3, username: "bob", email: "bob@example.com", resetToken: null, isAdmin: false },
  { id: 4, username: "charlie", email: "charlie@example.com", resetToken: null, isAdmin: false }
];

export default function WeakPasswordResetChallenge() {
  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Application state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showFlag, setShowFlag] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [resetStep, setResetStep] = useState<"email" | "token" | "new-password">("email");
  
  // Generate a predictable token based on timestamp
  // This is the vulnerability - tokens are predictable because they're based on the timestamp
  const generateWeakToken = (userId: number) => {
    const now = Date.now();
    // Simple algorithm: base64 encode of "userId:timestamp" with some character substitutions
    const tokenBase = `${userId}:${now}`;
    const weakToken = btoa(tokenBase)
      .replace(/=/g, '')  // Remove base64 padding
      .substring(0, 8);   // Take first 8 chars
    
    return weakToken;
  };
  
  // Even weaker token for admin (the main vulnerability target)
  // For admin, tokens are even more predictable - just 4 digits based on seconds
  const generateAdminToken = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    
    // Simply use the current time as the token (very predictable)
    // Format: last 2 digits of minutes + seconds (e.g., 1234 for 12:34)
    const tokenDigits = `${minutes % 100}${seconds < 10 ? '0' + seconds : seconds}`;
    return tokenDigits;
  };
  
  // Handle password reset request
  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Find user by email
    const user = USERS.find(u => u.email === email);
    
    if (!user) {
      setError("Email not found");
      return;
    }
    
    // Generate token based on user
    let token;
    if (user.isAdmin) {
      token = generateAdminToken();
    } else {
      token = generateWeakToken(user.id);
    }
    
    // Update user token
    user.resetToken = token;
    
    // Add to reset requests log
    const request = {
      id: resetRequests.length + 1,
      userId: user.id,
      username: user.username,
      email: user.email,
      token: user.isAdmin ? '****' : token, // Hide admin token, show others
      timestamp: new Date().toISOString(),
      isAdmin: user.isAdmin
    };
    
    setResetRequests([...resetRequests, request]);
    
    // Show success message
    setSuccess(`Password reset link sent to ${email}. Use the token to reset your password.`);
    setResetStep("token");
    
    // For non-admin users, we'll show the token directly in the UI to simplify the challenge
    // In a real app, this would be sent via email
    if (!user.isAdmin) {
      setSuccess(`Password reset token for ${email} is: ${token}`);
    }
    
    // Clear form
    setEmail("");
  };
  
  // Handle token validation
  const handleTokenValidation = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Increment attempt counter
    setAttemptCount(prev => prev + 1);
    
    // Find user with matching username and token
    const user = USERS.find(u => u.username === username && u.resetToken === resetToken);
    
    if (!user) {
      setError("Invalid username or token");
      return;
    }
    
    // Proceed to password reset
    setSuccess("Token validated. You can now reset your password.");
    setResetStep("new-password");
  };
  
  // Handle password update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    // Find user with matching username
    const user = USERS.find(u => u.username === username);
    
    if (!user || user.resetToken !== resetToken) {
      setError("Invalid session. Please restart the password reset process.");
      return;
    }
    
    // Update password (simulated)
    setSuccess(`Password for ${username} has been updated successfully.`);
    
    // Clear token after use
    user.resetToken = null;
    
    // Set current user
    setCurrentUser(user);
    
    // Show flag if admin account was compromised
    if (user.isAdmin && user.hasFlag) {
      setShowFlag(true);
    }
    
    // Clear form
    setResetToken("");
    setNewPassword("");
  };
  
  // Reset the challenge
  const handleReset = () => {
    // Reset all users' tokens
    USERS.forEach(user => {
      user.resetToken = null;
    });
    
    // Reset state
    setEmail("");
    setUsername("");
    setResetToken("");
    setNewPassword("");
    setCurrentUser(null);
    setShowFlag(false);
    setError("");
    setSuccess("");
    setResetRequests([]);
    setAttemptCount(0);
    setResetStep("email");
  };
  
  // Helper function to get a hint for predicting admin token
  const getAdminTokenHint = () => {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    
    return `Current time: ${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
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
          <h1 className="text-2xl font-bold">Weak Password Reset Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Recovery System</CardTitle>
            <CardDescription>
              Reset your password using our secure account recovery system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-6" variant="default">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Admin Account Compromised!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully exploited the weak password reset mechanism and accessed the admin account!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/13/submit`}>
                      <Button className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 mr-2" />
                        <span>Submit Your Flag</span>
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              {resetStep === "email" && (
                <form onSubmit={handleResetRequest} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex mt-1">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          className="pl-8"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="ml-2">
                        Request Reset
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      We'll send a reset token to your email
                    </p>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">Available Test Accounts</h3>
                    <div className="space-y-2">
                      {USERS.map((user) => (
                        <div key={user.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{user.username}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{user.email}</Badge>
                            {user.isAdmin && <Badge className="bg-yellow-500">Admin</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              )}
              
              {resetStep === "token" && (
                <form onSubmit={handleTokenValidation} className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="flex mt-1">
                      <div className="relative flex-grow">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="username"
                          placeholder="Enter your username"
                          className="pl-8"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="token">Reset Token</Label>
                    <div className="flex mt-1">
                      <div className="relative flex-grow">
                        <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="token"
                          placeholder="Enter your reset token"
                          className="pl-8"
                          value={resetToken}
                          onChange={(e) => setResetToken(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="ml-2">
                        Verify Token
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the token you received via email
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setResetStep("email")}
                    >
                      ← Back to Email
                    </Button>
                    
                    {attemptCount > 2 && username === "admin" && (
                      <p className="text-xs text-blue-600">
                        Hint: Admin tokens follow a pattern based on {getAdminTokenHint()}
                      </p>
                    )}
                  </div>
                </form>
              )}
              
              {resetStep === "new-password" && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="flex mt-1">
                      <div className="relative flex-grow">
                        <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Enter new password"
                          className="pl-8"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" className="ml-2">
                        Update Password
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setResetStep("token")}
                    >
                      ← Back to Token Verification
                    </Button>
                  </div>
                </form>
              )}
              
              {resetRequests.length > 0 && (
                <div className="mt-8">
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Reset Requests Log</h3>
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Username</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Token</th>
                          <th className="px-4 py-2 text-left">Time</th>
                          <th className="px-4 py-2 text-left">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {resetRequests.map((request) => (
                          <tr key={request.id}>
                            <td className="px-4 py-2">{request.id}</td>
                            <td className="px-4 py-2">{request.username}</td>
                            <td className="px-4 py-2">{request.email}</td>
                            <td className="px-4 py-2">
                              {request.isAdmin ? (
                                <span className="text-gray-400">****</span>
                              ) : (
                                <code className="bg-gray-100 p-1 rounded">{request.token}</code>
                              )}
                            </td>
                            <td className="px-4 py-2">{new Date(request.timestamp).toLocaleTimeString()}</td>
                            <td className="px-4 py-2">
                              {request.isAdmin ? (
                                <Badge className="bg-yellow-500">Admin</Badge>
                              ) : (
                                <Badge variant="outline">User</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Challenge Overview</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="learn">Learn More</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Weak Password Reset Vulnerability</h3>
                <p className="mb-4">
                  A weak password reset implementation can allow attackers to gain unauthorized access
                  to user accounts. Common vulnerabilities include predictable reset tokens, token reuse,
                  and insufficient validation of user identity.
                </p>
                <p>
                  In this challenge, you need to:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mb-4">
                  <li>Analyze how reset tokens are generated</li>
                  <li>Identify patterns in token generation, especially for admin users</li>
                  <li>Predict or guess a valid token for the admin account</li>
                  <li>Use that token to reset the admin's password and access the flag</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Look at the reset tokens generated for regular users</li>
                  <li>Admin tokens use a different (and weaker) generation algorithm</li>
                  <li>The admin token is related to the current time</li>
                  <li>Multiple attempts might be necessary to guess the correct token</li>
                  <li>Try to understand how tokens are generated to predict future ones</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learn">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About Weak Password Reset Vulnerabilities</h3>
                <p className="mb-4">
                  Password reset functionality is a critical security component that, when implemented insecurely,
                  can undermine an application's entire authentication system. Common weaknesses include:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><strong>Predictable tokens</strong>: Reset tokens that follow patterns or are based on predictable values like timestamps</li>
                  <li><strong>Short tokens</strong>: Tokens with insufficient entropy that are vulnerable to brute-force attacks</li>
                  <li><strong>Lack of rate limiting</strong>: Allowing unlimited attempts to guess tokens</li>
                  <li><strong>Long token lifetime</strong>: Tokens that remain valid for extended periods</li>
                  <li><strong>Reusable tokens</strong>: Tokens that can be used multiple times</li>
                </ul>
                <p className="mb-4">
                  Best practices for secure password reset:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li>Use cryptographically secure random token generation</li>
                  <li>Implement sufficient token length and complexity</li>
                  <li>Set short expiration times (15-60 minutes)</li>
                  <li>Enforce one-time use of tokens</li>
                  <li>Apply rate limiting to prevent brute-force attacks</li>
                  <li>Verify user identity through multiple factors when possible</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {resetRequests.length} reset requests made
                {resetRequests.length > 0 && !showFlag && " - Analyze the tokens to find patterns"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
