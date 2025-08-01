"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Open Redirect Challenge

You've discovered a website that redirects users to different partner websites. Your task is to exploit an open redirect vulnerability to redirect users to a malicious site.

### Hints:
- Look at how the redirect mechanism works
- Check if the redirect URL is properly validated
- Try manipulating redirect parameters to point to external sites
- The flag will be revealed when you successfully exploit the vulnerability
`;

// Flag for this challenge
const FLAG = "CTF{open_redirect_no_validation}";

// Safe domains that should be allowed for redirection
const SAFE_DOMAINS = [
  "partner1.example.com",
  "partner2.example.com", 
  "shop.securesite.org"
];

// Mock attacker site (this would be the target for the redirect exploit)
const ATTACKER_SITE = "evil-site.com";

export default function OpenRedirectChallenge() {
  const [destination, setDestination] = useState("partner1.example.com");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);
  
  // Handle redirect click
  const handleRedirect = () => {
    setError("");
    setIsRedirecting(true);
    setAttemptCount(prev => prev + 1);
    
    // This is the vulnerable part - it doesn't properly validate the URL
    // It only checks if the destination string includes a safe domain, which can be bypassed
    const isValidDestination = SAFE_DOMAINS.some(domain => destination.includes(domain));
    
    if (isValidDestination) {
      // Create a redirect URL with a vulnerable 'url' parameter
      setRedirectUrl(`/redirect?url=${encodeURIComponent(destination)}`);
      
      // Simulate the redirect process
      setTimeout(() => {
        setIsRedirecting(false);
        
        // Check if the exploit succeeded (redirected to attacker site)
        if (destination.includes(ATTACKER_SITE)) {
          setShowFlag(true);
        }
      }, 2000);
    } else {
      setIsRedirecting(false);
      setError("Redirect failed: Invalid destination");
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setDestination("partner1.example.com");
    setRedirectUrl("");
    setIsRedirecting(false);
    setShowFlag(false);
    setError("");
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
          <h1 className="text-2xl font-bold">Open Redirect Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Secure Partner Redirect Portal</CardTitle>
            <CardDescription>
              This portal safely redirects users to our trusted partner websites
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully exploited the open redirect vulnerability!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/8/submit`}>
                      <Button className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 mr-2" />
                        <span>Submit Your Flag</span>
                      </Button>
                    </Link>
                  </div>
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
            
            <div className="mb-6 p-4 border rounded-md">
              <h3 className="text-lg font-medium mb-4">Redirect to Partner Site</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="destination">Destination URL</Label>
                  <div className="flex mt-1">
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination URL"
                      className="flex-1 mr-2"
                    />
                    <Button onClick={handleRedirect} disabled={isRedirecting}>
                      {isRedirecting ? (
                        "Redirecting..."
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Go to Site
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {redirectUrl && (
                  <div className="p-3 bg-gray-100 rounded-md">
                    <p className="text-sm">Redirect URL:</p>
                    <code className="text-xs break-all">{redirectUrl}</code>
                  </div>
                )}
                
                {isRedirecting && (
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-md">
                    <p className="text-center">Redirecting to {destination}...</p>
                  </div>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium mb-2">Available Partner Sites</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAFE_DOMAINS.map((domain, index) => (
                      <TableRow key={index}>
                        <TableCell>Partner {index + 1}</TableCell>
                        <TableCell>
                          <code>{domain}</code>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setDestination(domain)}
                          >
                            Select
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="code">Code Snippet</TabsTrigger>
            <TabsTrigger value="info">About Open Redirects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The redirect feature checks if the URL contains a trusted domain name</li>
                  <li>What happens if you include a trusted domain as part of another URL?</li>
                  <li>Try crafting a URL that appears legitimate but actually redirects elsewhere</li>
                  <li>You need to redirect to <code>evil-site.com</code> to get the flag</li>
                  {attemptCount > 3 && (
                    <li className="text-blue-600">
                      Try something like: <code>https://evil-site.com?next=partner1.example.com</code> or 
                      <code>evil-site.com/partner1.example.com</code>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="code">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Redirect Code Snippet</h3>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] text-sm">
                  <pre className="text-xs"><code>{`
// Server-side redirect code (simplified)
function redirectToPartner(req, res) {
  const { url } = req.query;
  
  // Security check - make sure URL includes one of our partner domains
  const isValidDestination = SAFE_DOMAINS.some(domain => url.includes(domain));
  
  if (isValidDestination) {
    // Redirect if domain check passes
    return res.redirect(url);
  } else {
    return res.status(400).send("Invalid redirect destination");
  }
}
                  `}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About Open Redirect Vulnerabilities</h3>
                <p className="mb-4">
                  Open redirect vulnerabilities occur when a web application accepts untrusted input that could cause the web application to
                  redirect the user to a malicious site. This is often due to inadequate validation of user-supplied URLs in redirect parameters.
                </p>
                <p className="mb-4">
                  Common exploit patterns include:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Using the legitimate domain as a subdomain or path of a malicious site</li>
                  <li>Including the legitimate domain as a parameter in a malicious URL</li>
                  <li>Using URL encoding to hide the actual destination</li>
                </ul>
                <p>
                  The proper fix is to either use a whitelist of absolute URLs or relative paths, or to use indirect references
                  that map to actual URLs on the server side.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Redirect attempts: {attemptCount}
                {attemptCount > 5 && !showFlag && " - Try checking the code snippet for clues!"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
