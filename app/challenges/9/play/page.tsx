"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, AlertCircle, CheckCircle, Code, FileSearch } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Information Disclosure Challenge

You're testing a company's API endpoints for security vulnerabilities. Your task is to find sensitive information that might be accidentally exposed through HTTP headers, error messages, or other response data.

### Hints:
- Look at HTTP response headers for leaky information
- Error responses sometimes reveal more than they should
- Check for debug information in responses
- Try accessing endpoints with different methods or parameters
`;

// Flag for this challenge
const FLAG = "CTF{leaky_headers_reveal_secrets}";

// Simulated API endpoints
const API_ENDPOINTS = [
  {
    path: "/api/users",
    method: "GET",
    description: "Get all users",
    requiresAuth: true,
    response: {
      status: 401,
      body: { error: "Authentication required" },
      headers: { 
        "Content-Type": "application/json",
        "X-Powered-By": "Express/4.17.1"
      }
    }
  },
  {
    path: "/api/products",
    method: "GET", 
    description: "Get all products",
    requiresAuth: false,
    response: {
      status: 200,
      body: [
        { id: 1, name: "Product 1", price: 19.99 },
        { id: 2, name: "Product 2", price: 29.99 },
      ],
      headers: { 
        "Content-Type": "application/json",
        "X-Powered-By": "Express/4.17.1",
        "Server": "Apache/2.4.41 (Ubuntu)"
      }
    }
  },
  {
    path: "/api/admin",
    method: "GET",
    description: "Admin dashboard data",
    requiresAuth: true,
    response: {
      status: 401,
      body: { error: "Administrator access required", server: "internal-prod-server-03" },
      headers: { 
        "Content-Type": "application/json",
        "X-Powered-By": "Express/4.17.1",
        "Server": "Apache/2.4.41 (Ubuntu)",
        "X-Environment": "Production",
        // This header contains the flag - this is what they need to find
        "X-Debug-Token": FLAG
      }
    }
  },
  {
    path: "/api/health",
    method: "GET", 
    description: "API health check",
    requiresAuth: false,
    response: {
      status: 200,
      body: { 
        status: "healthy", 
        uptime: "3d 4h 12m",
        version: "v1.2.3",
        database: "connected",
        cache: "connected",
        environment: "production"
      },
      headers: { 
        "Content-Type": "application/json",
        "X-Powered-By": "Express/4.17.1",
        "Server": "Apache/2.4.41 (Ubuntu)",
        "X-Database-Version": "MongoDB 4.4.6"
      }
    }
  }
];

export default function InformationDisclosureChallenge() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [response, setResponse] = useState<any>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [foundHeaderName, setFoundHeaderName] = useState("");
  const [requestCount, setRequestCount] = useState(0);
  
  // Handle API request
  const handleRequest = (endpoint: any) => {
    setSelectedEndpoint(endpoint);
    setResponse(endpoint.response);
    setRequestCount(prev => prev + 1);
    
    // Reset flag state on each new request
    setShowFlag(false);
    setFoundHeaderName("");
    
    // Just for display purposes - increment the request counter
    const newCount = requestCount + 1;
    if (newCount > 5) {
      // Start showing hint after 5 requests
      setShowHeaders(true);
    }
  };
  
  // Check if a header contains the flag
  const checkHeaderForFlag = (headerName: string, headerValue: string) => {
    if (headerValue === FLAG) {
      setShowFlag(true);
      setFoundHeaderName(headerName);
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setSelectedEndpoint(null);
    setResponse(null);
    setShowHeaders(false);
    setShowFlag(false);
    setFoundHeaderName("");
    setRequestCount(0);
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
          <h1 className="text-2xl font-bold">Information Disclosure Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Testing Tool</CardTitle>
            <CardDescription>
              Test company API endpoints and inspect responses for information disclosure vulnerabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  <p>You've found a information disclosure vulnerability in the <code>{foundHeaderName}</code> header!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/9/submit`}>
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
              <h3 className="text-lg font-medium mb-4">Available API Endpoints</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Path</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Auth Required</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {API_ENDPOINTS.map((endpoint, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <code>{endpoint.path}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </TableCell>
                      <TableCell>{endpoint.description}</TableCell>
                      <TableCell>{endpoint.requiresAuth ? "Yes" : "No"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRequest(endpoint)}
                        >
                          Send Request
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {response && (
              <div className="border rounded-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Response from {selectedEndpoint.path}</h3>
                  <Badge variant={response.status < 400 ? "default" : "destructive"}>
                    Status: {response.status}
                  </Badge>
                </div>
                
                <Tabs defaultValue="body" className="mb-4">
                  <TabsList>
                    <TabsTrigger value="body">Response Body</TabsTrigger>
                    <TabsTrigger value="headers" className={showHeaders ? "animate-pulse text-blue-600" : ""}>
                      Response Headers
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="body">
                    <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] font-mono text-sm">
                      <pre>{JSON.stringify(response.body, null, 2)}</pre>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="headers">
                    <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Header Name</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(response.headers).map(([name, value]: [string, any], index) => (
                            <TableRow key={index} className={name === "X-Debug-Token" ? "bg-yellow-50" : ""}>
                              <TableCell>
                                <code>{name}</code>
                                {name === "X-Debug-Token" && showHeaders && (
                                  <Badge className="ml-2 bg-yellow-200 text-yellow-800">Suspicious</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-between items-center">
                                  <code>{value as string}</code>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => checkHeaderForFlag(name, value as string)}
                                  >
                                    <FileSearch className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="info">About Information Disclosure</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Check both response bodies and headers for sensitive information</li>
                  <li>Sometimes, error responses contain more information than successful ones</li>
                  <li>Look for headers that might not belong in a production environment</li>
                  <li>Debug or development-related headers can leak sensitive data</li>
                  {requestCount > 3 && (
                    <li className="text-blue-600">
                      Try checking the headers tab for all responses, especially for admin-related endpoints
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About Information Disclosure Vulnerabilities</h3>
                <p className="mb-4">
                  Information disclosure vulnerabilities occur when an application unintentionally reveals sensitive information to users.
                  This can include technical details about the environment, debugging information, or even credentials.
                </p>
                <p className="mb-4">
                  Common sources of information disclosure include:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>HTTP headers revealing software versions or server configurations</li>
                  <li>Detailed error messages exposing stack traces or database information</li>
                  <li>Debug information left in production environments</li>
                  <li>Hidden fields in HTML or JavaScript containing sensitive data</li>
                  <li>Metadata in files (like documents or images) with author information</li>
                </ul>
                <p>
                  To prevent information disclosure, applications should implement proper error handling, sanitize outputs,
                  configure security headers correctly, and ensure debugging information is disabled in production.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                API requests made: {requestCount}
                {requestCount > 5 && !showFlag && " - Don't forget to check the headers tab!"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
