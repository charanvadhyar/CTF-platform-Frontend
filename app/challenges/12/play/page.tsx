"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, Terminal, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Robots.txt Disclosure Challenge

You're tasked with finding hidden information on a corporate website. Your goal is to discover directories and files that are not meant to be accessed by regular users.

### Hints:
- Check common web files that provide information about the site structure
- Some files might explicitly tell search engines what NOT to index
- Explore metadata and site configuration files
`;

// Flag for this challenge
const FLAG = "CTF{r0b0ts_txt_d1scl0sur3_vuln}";

// Simulated file structure of the target website
const SITE_STRUCTURE = [
  { path: "/", name: "Home Page", description: "Main landing page", accessible: true },
  { path: "/about", name: "About Us", description: "Company information", accessible: true },
  { path: "/products", name: "Products", description: "Product listing", accessible: true },
  { path: "/contact", name: "Contact", description: "Contact information", accessible: true },
  { path: "/blog", name: "Blog", description: "Company blog", accessible: true },
  { path: "/admin", name: "Admin Panel", description: "Admin login page", accessible: false },
  { path: "/backup", name: "Backups", description: "Database backups", accessible: false },
  { path: "/dev", name: "Development", description: "Development resources", accessible: false },
  { path: "/internal", name: "Internal", description: "Internal documents", accessible: false },
  { path: "/staging", name: "Staging", description: "Staging environment", accessible: false },
  { path: "/dev/debug.php", name: "Debug Page", description: "Debug information", accessible: false },
  { path: "/backup/db_backup_2023.sql", name: "Database Backup", description: "SQL database backup", accessible: false },
  { path: "/internal/staff_portal.html", name: "Staff Portal", description: "Staff access portal", accessible: false },
  { path: "/secret_admin_portal", name: "Secret Admin", description: "Hidden admin portal with flag", accessible: false, hasFlag: true }
];

// Simulated robots.txt content
const ROBOTS_TXT_CONTENT = `
# robots.txt for SecureCorp Inc.
User-agent: *
Disallow: /admin
Disallow: /backup
Disallow: /dev
Disallow: /internal
Disallow: /staging
Disallow: /secret_admin_portal # Contains sensitive flag - keep hidden!

User-agent: Googlebot
Allow: /

Sitemap: https://www.securecorp.com/sitemap.xml
`;

export default function RobotsTxtDisclosureChallenge() {
  const [urlInput, setUrlInput] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [visitedPaths, setVisitedPaths] = useState<string[]>(["/"]);
  const [responseContent, setResponseContent] = useState<string>("");
  const [showFlag, setShowFlag] = useState(false);
  const [error, setError] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [browserHistory, setBrowserHistory] = useState<Array<{path: string, timestamp: string}>>([
    { path: "/", timestamp: new Date().toISOString() }
  ]);
  
  // Simulated browser navigation
  const navigateTo = (path: string) => {
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    
    // Normalize path by removing trailing slash except for root
    if (path !== "/" && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    
    setUrlInput(path);
    setCurrentPath(path);
    
    // Add to browser history
    setBrowserHistory(prev => [...prev, { path, timestamp: new Date().toISOString() }]);
    
    // Add to visited paths if not already included
    if (!visitedPaths.includes(path)) {
      setVisitedPaths(prev => [...prev, path]);
    }
    
    // Generate response for the path
    handleResponse(path);
  };
  
  // Handle URL submission from input
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(urlInput);
  };
  
  // Generate simulated response content based on path
  const handleResponse = (path: string) => {
    setError("");
    setShowFlag(false);
    
    // Special case for robots.txt
    if (path === "/robots.txt") {
      setResponseContent(`<pre class="text-xs font-mono p-4 bg-gray-100 rounded-md overflow-auto">${ROBOTS_TXT_CONTENT}</pre>`);
      return;
    }
    
    // Special case for secret admin portal
    if (path === "/secret_admin_portal") {
      setResponseContent(`
        <div class="p-4">
          <h2 class="text-xl font-bold mb-4">Secret Admin Portal</h2>
          <p class="mb-4">Welcome to the secret admin portal. This page contains sensitive information.</p>
          <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
            <p class="font-bold">Confidential</p>
            <p>This page should not be indexed by search engines or accessed by unauthorized users.</p>
          </div>
          <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p class="font-bold">Flag</p>
            <p>Congratulations! You've found the flag: ${FLAG}</p>
          </div>
        </div>
      `);
      setShowFlag(true);
      return;
    }
    
    // Check if the path exists in site structure
    const pathInfo = SITE_STRUCTURE.find(p => p.path === path);
    
    if (pathInfo) {
      if (pathInfo.accessible) {
        setResponseContent(`
          <div class="p-4">
            <h2 class="text-xl font-bold mb-4">${pathInfo.name}</h2>
            <p class="mb-4">${pathInfo.description}</p>
            <p>This is a regular page with public content.</p>
          </div>
        `);
      } else {
        setResponseContent(`
          <div class="p-4">
            <h2 class="text-xl font-bold mb-4">${pathInfo.name}</h2>
            <p class="mb-4">${pathInfo.description}</p>
            <div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
              <p class="font-bold">Restricted Area</p>
              <p>This directory is not meant for public access but was found in robots.txt.</p>
            </div>
          </div>
        `);
      }
    } else {
      setResponseContent(`
        <div class="p-4">
          <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p class="font-bold">404 Not Found</p>
            <p>The requested URL ${path} was not found on this server.</p>
          </div>
        </div>
      `);
    }
  };
  
  // Reset the challenge
  const handleReset = () => {
    setUrlInput("");
    setCurrentPath("/");
    setVisitedPaths(["/"]);
    setResponseContent("");
    setShowFlag(false);
    setError("");
    setShowHints(false);
    setBrowserHistory([{ path: "/", timestamp: new Date().toISOString() }]);
    
    // Initial response
    handleResponse("/");
  };
  
  // Initialize with home page
  useState(() => {
    handleResponse("/");
  });
  
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
          <h1 className="text-2xl font-bold">Robots.txt Disclosure Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Web Browser Simulator</CardTitle>
            <CardDescription>
              Explore a simulated website to find hidden information
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
                  <p>You've successfully discovered the hidden page and found the flag!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/12/submit`}>
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
              <div className="border rounded-md">
                <div className="bg-gray-100 border-b p-3 flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <form onSubmit={handleUrlSubmit} className="flex-1 flex space-x-2">
                    <div className="bg-white flex-1 flex items-center border rounded-md px-3">
                      <span className="text-gray-500 text-sm mr-2">https://www.securecorp.com</span>
                      <Input 
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="/"
                      />
                    </div>
                    <Button type="submit" size="sm">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                
                <div className="p-4 min-h-[200px] max-h-[400px] overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: responseContent }} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Browser History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[200px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Path</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {browserHistory.map((entry, i) => {
                            const time = new Date(entry.timestamp).toLocaleTimeString();
                            return (
                              <TableRow key={i}>
                                <TableCell className="font-mono text-xs">{entry.path}</TableCell>
                                <TableCell className="text-xs">{time}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => navigateTo(entry.path)}
                                  >
                                    <ArrowLeft className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Common Files & Paths</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowHints(!showHints)}
                      >
                        {showHints ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {showHints ? (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 mb-2">
                          Click on any path to navigate to it:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            "/robots.txt",
                            "/sitemap.xml",
                            "/.htaccess",
                            "/favicon.ico",
                            "/admin",
                            "/login",
                            "/wp-admin",
                            "/backup",
                            "/config",
                            "/.git"
                          ].map((path, i) => (
                            <Button 
                              key={i} 
                              variant="outline" 
                              size="sm" 
                              className="justify-start font-mono text-xs"
                              onClick={() => navigateTo(path)}
                            >
                              {path}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-24 text-center">
                        <p className="text-sm text-gray-500">
                          Click the eye icon to show common files & paths
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
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
                <h3 className="font-medium mb-2">Robots.txt Disclosure Vulnerability</h3>
                <p className="mb-4">
                  The robots.txt file is used to instruct web crawlers and search engines which parts of a website
                  should or should not be scanned and indexed. However, this file is publicly accessible and can 
                  inadvertently reveal sensitive directories and files that should remain hidden.
                </p>
                <p>
                  In this challenge, you need to:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mb-4">
                  <li>Find and examine the robots.txt file</li>
                  <li>Identify directories and paths that are meant to be hidden</li>
                  <li>Navigate to those hidden paths</li>
                  <li>Find the path containing the flag</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The robots.txt file is always located at the root of a website</li>
                  <li>Look for "Disallow" directives in the robots.txt file</li>
                  <li>Sometimes developers include comments in robots.txt that reveal more information</li>
                  <li>Try visiting each of the disallowed paths</li>
                  <li>Pay special attention to paths with interesting names or those that might contain sensitive information</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learn">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About Robots.txt Information Disclosure</h3>
                <p className="mb-4">
                  The robots.txt file is a standard used by websites to communicate with web crawlers and other automated agents.
                  It tells search engines which parts of the site should not be scanned or indexed in search results.
                </p>
                <p className="mb-4">
                  However, this creates a security issue: by listing directories and files that should remain hidden, 
                  robots.txt actually advertises their existence to potential attackers. Many security issues have been
                  discovered by simply looking at what a site explicitly tells crawlers not to index.
                </p>
                <p className="mb-4">
                  Best practices for handling sensitive content:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li>Don't rely on robots.txt for security through obscurity</li>
                  <li>Use proper authentication and authorization for sensitive areas</li>
                  <li>Consider not listing truly sensitive directories in robots.txt at all</li>
                  <li>Use generic names for admin directories rather than obvious ones</li>
                  <li>Implement proper access controls rather than hoping content won't be discovered</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {visitedPaths.length} paths visited
                {!visitedPaths.includes("/robots.txt") && " - Have you checked robots.txt yet?"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
