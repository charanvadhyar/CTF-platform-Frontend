"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, LogIn, Lock, Unlock, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import Cookies from 'js-cookie';

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Cookie Manipulation Challenge

You've been given access to a simple web application that uses cookies for authentication. Your task is to manipulate the cookies to gain administrative access.

### Hints:
- Examine how the application uses cookies to determine user roles
- The flag is only visible to users with admin privileges
- Try manipulating the existing cookies rather than trying to guess admin credentials
`;

// Flag for this challenge (same as in backend)
const FLAG = "CTF{cookie_manipulation_admin}";

export default function CookieManipulationChallenge() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [viewCookies, setViewCookies] = useState(false);
  
  // Check for existing cookies on load
  useEffect(() => {
    const userRole = Cookies.get('user_role');
    const loggedIn = Cookies.get('logged_in');
    
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
      setUsername(Cookies.get('username') || "user");
      
      // Check if admin (vulnerable check)
      if (userRole === 'admin') {
        setIsAdmin(true);
      }
    }
  }, []);
  
  // Handle login form submission
  const handleLogin = () => {
    setError("");
    setSuccessMessage("");
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }
    
    // Set login cookies (intentionally insecure)
    if (username === "user" && password === "password") {
      // Set cookies for regular user
      Cookies.set('logged_in', 'true', { expires: 1 });
      Cookies.set('username', username, { expires: 1 });
      Cookies.set('user_role', 'user', { expires: 1 });
      
      setIsLoggedIn(true);
      setIsAdmin(false);
      setSuccessMessage("Logged in as regular user!");
    } else {
      setError("Invalid credentials");
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    // Remove cookies
    Cookies.remove('logged_in');
    Cookies.remove('username');
    Cookies.remove('user_role');
    
    // Reset state
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUsername("");
    setPassword("");
    setError("");
    setSuccessMessage("");
  };
  
  // Get all cookies as a formatted string
  const getAllCookies = () => {
    const cookieObject: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      cookieObject[key] = value;
    });
    return JSON.stringify(cookieObject, null, 2);
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
          <h1 className="text-2xl font-bold">Cookie Manipulation Challenge</h1>
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
        
        {/* Admin Panel - Only visible if admin */}
        {isLoggedIn && isAdmin && (
          <Card className="mb-6 bg-green-50 border-green-300">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Unlock className="h-5 w-5 mr-2 text-green-600" />
                <span className="text-green-800">Admin Panel</span>
              </CardTitle>
              <CardDescription className="text-green-700">
                Welcome, Administrator!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-white rounded border border-green-200">
                <h3 className="text-lg font-medium mb-4 text-green-700">Restricted Content</h3>
                <p className="mb-4">You have successfully gained administrative access!</p>
                <div className="bg-gray-100 border p-3 rounded">
                  <h4 className="font-medium mb-2">Secret Flag</h4>
                  <p className="font-mono text-sm bg-black text-green-400 p-2 rounded">{FLAG}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Login/Logout Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {isLoggedIn ? "User Dashboard" : "User Login"}
            </CardTitle>
            <CardDescription>
              {isLoggedIn 
                ? `Welcome back, ${username}!` 
                : "Login to access your dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertTitle className="text-red-700">Error</AlertTitle>
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertTitle className="text-green-700">Success</AlertTitle>
                <AlertDescription className="text-green-600">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}
            
            {isLoggedIn ? (
              <div>
                <div className="p-4 border rounded mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Your Account Details</h3>
                    <span className={`px-2 py-1 text-xs rounded ${isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isAdmin ? 'Admin User' : 'Regular User'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">
                    Username: <span className="font-medium">{username}</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Role: <span className="font-medium">{isAdmin ? 'Administrator' : 'Regular User'}</span>
                  </p>
                  
                  {!isAdmin && (
                    <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
                      <p>
                        <Lock className="inline h-4 w-4 mr-1 text-gray-600" />
                        <span>Admin features are not available to you</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => setViewCookies(!viewCookies)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {viewCookies ? "Hide Cookies" : "View Cookies"}
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    className="ml-auto"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
                
                {viewCookies && (
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <h4 className="text-sm font-medium mb-2">Current Cookies:</h4>
                    <pre className="text-xs bg-black text-white p-2 rounded overflow-x-auto">
                      {document.cookie.split(';').map(cookie => cookie.trim()).join('\n')}
                    </pre>
                    <p className="mt-2 text-xs text-gray-500">
                      <strong>Hint:</strong> Try modifying these cookies to gain admin access
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full flex items-center justify-center"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-500">
              {!isLoggedIn && (
                <p>Default login: user / password</p>
              )}
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link href={`/challenges/4/submit`}>
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
