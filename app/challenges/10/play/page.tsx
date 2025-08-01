"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Lock, UnlockIcon, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## JWT None Attack Challenge

You have access to a JWT-secured API. Your task is to exploit a vulnerability in the JWT implementation to gain unauthorized admin access.

### Hints:
- Look at how the JWT is structured and validated
- Examine the token's algorithm field
- Try modifying the JWT header and payload
- Look into the "none" algorithm vulnerability in JWT
`;

// Flag for this challenge
const FLAG = "CTF{jwt_none_alg_vulnerability}";

// Sample user data
const USERS = {
  regular: {
    id: 123,
    username: "user123",
    role: "user",
    permissions: ["read", "comment"]
  },
  admin: {
    id: 999,
    username: "admin",
    role: "admin",
    permissions: ["read", "write", "delete", "manage_users"],
    flagAccess: true
  }
};

export default function JwtNoneAttackChallenge() {
  // Valid JWT for regular user (alg: HS256)
  const validUserJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJ1c2VybmFtZSI6InVzZXIxMjMiLCJyb2xlIjoidXNlciIsImlhdCI6MTY3NTk1MDAwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
  
  // Current JWT token state
  const [currentJwt, setCurrentJwt] = useState(validUserJwt);
  const [decodedHeader, setDecodedHeader] = useState<any>(null);
  const [decodedPayload, setDecodedPayload] = useState<any>(null);
  const [decodedSignature, setDecodedSignature] = useState("");
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showFlag, setShowFlag] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  // Decode JWT parts
  const decodeJwt = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      setDecodedHeader(header);
      setDecodedPayload(payload);
      setDecodedSignature(parts[2]);
      setError("");
    } catch (err: any) {
      setError(`Failed to decode JWT: ${err.message}`);
    }
  };
  
  // Create new JWT with modified header/payload
  const createJwt = (header: any, payload: any, signature: string) => {
    try {
      const headerBase64 = btoa(JSON.stringify(header));
      const payloadBase64 = btoa(JSON.stringify(payload));
      
      // Use the existing signature or an empty one if none alg is used
      const newJwt = `${headerBase64}.${payloadBase64}.${signature}`;
      setCurrentJwt(newJwt);
      setError("");
      
      return newJwt;
    } catch (err: any) {
      setError(`Failed to create JWT: ${err.message}`);
      return currentJwt;
    }
  };
  
  // Handle JWT verification (vulnerable to none algorithm)
  const verifyJwt = () => {
    try {
      // Decode current JWT
      const parts = currentJwt.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      
      let header;
      let payload;
      
      try {
        header = JSON.parse(atob(parts[0]));
        payload = JSON.parse(atob(parts[1]));
      } catch (err) {
        throw new Error("Invalid JWT encoding");
      }
      
      setAttemptCount(prev => prev + 1);
      
      // This is the vulnerable part - accepting "none" algorithm without signature validation
      if (header.alg === "none") {
        // For "none" algorithm, we don't validate the signature at all - this is the vulnerability
        
        // Fetch user data based on payload
        const user = payload.role === "admin" ? USERS.admin : USERS.regular;
        
        setIsAuthenticated(true);
        setCurrentUser(user);
        
        // If they successfully got admin role with none algorithm, show flag
        if (payload.role === "admin") {
          setShowFlag(true);
        }
      }
      // Regular JWT validation with HS256 (this would normally validate the signature)
      else if (header.alg === "HS256") {
        // In a real app, we'd validate the signature here
        // For this challenge, we're simulating that the original token is valid
        
        if (currentJwt === validUserJwt) {
          setIsAuthenticated(true);
          setCurrentUser(USERS.regular);
        } else {
          throw new Error("Invalid signature");
        }
      } else {
        throw new Error("Unsupported algorithm");
      }
      
      setError("");
    } catch (err: any) {
      setError(`JWT verification failed: ${err.message}`);
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setCurrentJwt(validUserJwt);
    decodeJwt(validUserJwt);
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowFlag(false);
    setError("");
  };
  
  // Initialize decoded JWT on component mount
  useState(() => {
    decodeJwt(currentJwt);
  });
  
  // Create exploited JWT (helper for users who need extra help)
  const createExploitJwt = () => {
    const header = { alg: "none", typ: "JWT" };
    const payload = {
      sub: "999",
      username: "admin",
      role: "admin",
      iat: 1675950000
    };
    
    // For none algorithm, signature can be empty
    return createJwt(header, payload, "");
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
          <h1 className="text-2xl font-bold">JWT None Attack Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>JWT Authentication System</CardTitle>
              {isAuthenticated ? (
                <Badge className="bg-green-500">Authenticated</Badge>
              ) : (
                <Badge variant="outline">Not Authenticated</Badge>
              )}
            </div>
            <CardDescription>
              Exploit JWT vulnerabilities to gain unauthorized access
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
            
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully exploited the JWT None algorithm vulnerability!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/10/submit`}>
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
              <div>
                <Label htmlFor="jwt" className="mb-2 block">JWT Token</Label>
                <Textarea 
                  id="jwt"
                  value={currentJwt}
                  onChange={(e) => {
                    setCurrentJwt(e.target.value);
                    decodeJwt(e.target.value);
                  }}
                  className="font-mono text-xs h-24"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={verifyJwt}>
                  Verify Token
                </Button>
                <Button variant="outline" onClick={() => decodeJwt(currentJwt)}>
                  Decode Token
                </Button>
              </div>
              
              {isAuthenticated && currentUser && (
                <Card className="border-2 border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UnlockIcon className="h-5 w-5 mr-2 text-green-500" />
                      Authentication Successful
                    </CardTitle>
                    <CardDescription>
                      You are logged in as {currentUser.username} with {currentUser.role} role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">User Details:</p>
                        <ul className="list-disc list-inside pl-4 text-sm">
                          <li>User ID: {currentUser.id}</li>
                          <li>Username: {currentUser.username}</li>
                          <li>Role: <Badge>{currentUser.role}</Badge></li>
                        </ul>
                      </div>
                      
                      <div>
                        <p className="font-medium">Permissions:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {currentUser.permissions.map((perm: string, i: number) => (
                            <Badge key={i} variant="secondary">{perm}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">JWT Structure</h3>
              
              {decodedHeader && decodedPayload && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm">Header</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
                        {JSON.stringify(decodedHeader, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm">Payload</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-auto">
                        {JSON.stringify(decodedPayload, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle className="text-sm">Signature</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 p-3 rounded-md text-xs overflow-auto break-all">
                        {decodedSignature || "<empty>"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="info">About JWT Vulnerabilities</TabsTrigger>
            <TabsTrigger value="help">Need Help?</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Look at the JWT header and its "alg" field</li>
                  <li>The "none" algorithm indicates that the JWT doesn't need a signature</li>
                  <li>Try changing the algorithm and user role</li>
                  <li>Remember to modify both the header and payload parts</li>
                  {attemptCount > 3 && (
                    <li className="text-blue-600">
                      Change the header to <code>{`{"alg":"none","typ":"JWT"}`}</code> and modify the payload to have <code>"role":"admin"</code>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About JWT None Algorithm Vulnerability</h3>
                <p className="mb-4">
                  JSON Web Tokens (JWTs) are structured as three base64-encoded parts separated by dots: header.payload.signature.
                  The header specifies the algorithm used for signing the token, such as HS256, RS256, or "none".
                </p>
                <p className="mb-4">
                  The "none" algorithm vulnerability occurs when a JWT implementation accepts tokens with the "none" algorithm,
                  which indicates that the token is not signed. In vulnerable implementations, the server will trust the token's
                  content without verifying its signature.
                </p>
                <p>
                  Attackers can exploit this by:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mb-4">
                  <li>Taking a valid JWT</li>
                  <li>Changing the header to use "alg":"none"</li>
                  <li>Modifying the payload to elevate privileges</li>
                  <li>Removing or emptying the signature part</li>
                </ol>
                <p>
                  Proper JWT implementations should reject tokens with the "none" algorithm or explicitly whitelist only
                  secure algorithms like HS256, RS256, etc.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="help">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Step-by-Step Guide</h3>
                <ol className="list-decimal pl-5 space-y-2 mb-4">
                  <li>Click "Decode Token" to see the current token structure</li>
                  <li>Notice the header uses "alg":"HS256" and the payload has "role":"user"</li>
                  <li>To exploit the vulnerability:
                    <ul className="list-disc pl-5 mt-2">
                      <li>Change the header to: <code>{`{"alg":"none","typ":"JWT"}`}</code></li>
                      <li>Change the payload to: <code>{`{"sub":"999","username":"admin","role":"admin","iat":1675950000}`}</code></li>
                      <li>The signature can be empty or any value (it won't be checked)</li>
                    </ul>
                  </li>
                  <li>Base64-encode each part and join with periods</li>
                  <li>Try "Verify Token" with your modified JWT</li>
                </ol>
                
                <Button 
                  onClick={() => {
                    const exploitJwt = createExploitJwt();
                    setCurrentJwt(exploitJwt);
                    decodeJwt(exploitJwt);
                  }}
                  variant="outline"
                >
                  Generate Exploit Token
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  (This will create an example exploit token but you still need to verify it)
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Verification attempts: {attemptCount}
                {attemptCount > 5 && !showFlag && " - Check the 'Need Help?' tab for detailed instructions"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
