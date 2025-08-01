"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, AlertCircle, User, File, Lock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Broken Access Control / IDOR Challenge

You've gained access to a user profile system where each user has their own profile page. Your task is to exploit an Insecure Direct Object Reference (IDOR) vulnerability to access data that should be restricted.

### Hints:
- Pay attention to how profile IDs are used in URL parameters
- Try manipulating ID parameters to access other users' data
- The system might not properly check if you have permission to view certain profiles
`;

// Flag for this challenge
const FLAG = "CTF{idor_broken_access_control_vulnerability}";

// Simulated user data
const USERS = [
  {
    id: 101,
    username: "regularuser",
    name: "Regular User",
    email: "user@example.com",
    profileImage: "/avatars/user.png",
    role: "user",
    documents: [
      { id: 1, name: "Personal Notes", content: "Just some regular notes..." },
      { id: 2, name: "Shopping List", content: "Milk, Bread, Eggs" }
    ]
  },
  {
    id: 999,
    username: "admin",
    name: "Administrator",
    email: "admin@example.com",
    profileImage: "/avatars/admin.png",
    role: "admin",
    documents: [
      { id: 3, name: "Secret Document", content: `Admin only document containing the flag: ${FLAG}` },
      { id: 4, name: "User List", content: "Full list of system users and their details" }
    ]
  }
];

export default function BrokenAccessControlChallenge() {
  const [currentUser, setCurrentUser] = useState(USERS[0]); // Start logged in as regular user
  const [profileId, setProfileId] = useState("101"); // Default to viewing own profile
  const [viewedUser, setViewedUser] = useState(USERS[0]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  
  // Handle profile view request
  const handleViewProfile = () => {
    // Insecure access control - simply checks if the ID exists, not if the user should have access
    const id = parseInt(profileId);
    const user = USERS.find(user => user.id === id);
    
    if (user) {
      setViewedUser(user);
      setError("");
      
      // Check if admin profile accessed by regular user (successful IDOR)
      if (user.id === 999 && currentUser.id !== 999) {
        setSuccess(true);
      }
    } else {
      setError(`No user with ID ${profileId} found`);
    }
  };
  
  // Handle document view
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    
    // Flag is found in the admin's secret document
    if (document.id === 3 && document.content.includes(FLAG)) {
      setShowFlag(true);
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setCurrentUser(USERS[0]);
    setProfileId("101");
    setViewedUser(USERS[0]);
    setSelectedDocument(null);
    setError("");
    setSuccess(false);
    setShowFlag(false);
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
          <h1 className="text-2xl font-bold">Broken Access Control Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Profile System</CardTitle>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{currentUser.username}</p>
                  <Badge variant="outline" className="text-xs">{currentUser.role}</Badge>
                </div>
              </div>
            </div>
            <CardDescription>
              Logged in as {currentUser.name} ({currentUser.email})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success && !showFlag && (
              <Alert className="mb-6 bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>IDOR Vulnerability Found!</AlertTitle>
                <AlertDescription>
                  You've successfully accessed the admin profile! Now try to view one of their documents to find the flag.
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  <p>You've exploited the IDOR vulnerability to access restricted content!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/7/submit`}>
                      <Button className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 mr-2" />
                        <span>Submit Your Flag</span>
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <Input 
                  type="text" 
                  placeholder="Enter user ID" 
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  className="mr-2 w-full"
                />
                <Button onClick={handleViewProfile}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
              
              <div className="border rounded-md p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl">{viewedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">{viewedUser.name}</h2>
                    <p className="text-gray-500">{viewedUser.email}</p>
                    <Badge>{viewedUser.role}</Badge>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-medium mb-2">User Documents</h3>
                  <div className="space-y-2">
                    {viewedUser.documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between border p-3 rounded-md cursor-pointer hover:bg-gray-50"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2 text-blue-500" />
                          <span>{doc.name}</span>
                        </div>
                        {doc.id === 3 && viewedUser.id === 999 && currentUser.id !== 999 && (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedDocument && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <File className="h-5 w-5 mr-2" />
                      {selectedDocument.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{selectedDocument.content}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="info">Challenge Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Notice how user profiles are accessed via ID numbers</li>
                  <li>The application might not check if you have permission to view a particular profile</li>
                  <li>Try different user IDs in the profile viewer</li>
                  <li>Once you find an interesting profile, try to access their documents</li>
                  <li>Admin users often have IDs like 1, 999, or 0</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About IDOR Vulnerabilities</h3>
                <p className="mb-4">
                  Insecure Direct Object References (IDOR) occur when an application provides direct access to objects based on user-supplied input.
                  As a result of this vulnerability, attackers can bypass authorization and access resources directly by modifying the value of a parameter
                  used to directly point to an object.
                </p>
                <p>
                  This is a common vulnerability in web applications that don't implement proper access controls. In this challenge,
                  the application doesn't verify if the currently logged in user has permission to view the requested profile or document.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Currently viewing profile with ID: {profileId}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
