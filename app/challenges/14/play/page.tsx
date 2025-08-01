"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Shield, AlertCircle, CheckCircle, Terminal, Code } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## CSP Bypass Challenge

This website has implemented a Content Security Policy to protect against XSS attacks. Your task is to find a way to bypass the CSP and execute JavaScript to steal the admin's cookie.

### Hints:
- Examine the CSP header carefully
- Look for misconfiguration or overly permissive rules
- Consider which sources are allowed for scripts
- Some CSP directives might be exploitable
`;

// Flag for this challenge
const FLAG = "CTF{csp_bypass_v1a_unsafe_eval}";

// Simulated CSP header with intentional vulnerability (unsafe-eval)
const CSP_HEADER = "default-src 'self'; script-src 'self' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'";

// Simulated admin cookie
const ADMIN_COOKIE = {
  name: "admin_session",
  value: FLAG,
  httpOnly: false, // Intentionally insecure
  secure: true,
  sameSite: "strict"
};

export default function CSPBypassChallenge() {
  // State for user input
  const [commentContent, setCommentContent] = useState("");
  const [userName, setUserName] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [executedCode, setExecutedCode] = useState<string | null>(null);
  const [showFlag, setShowFlag] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State to track if the admin has "visited" the page
  const [adminVisited, setAdminVisited] = useState(false);
  const [codeExecutionHistory, setCodeExecutionHistory] = useState<string[]>([]);
  
  // Function to simulate admin visiting the page
  const simulateAdminVisit = () => {
    setTimeout(() => {
      setAdminVisited(true);
      // Admin "views" the comments
      evaluateComments();
    }, 3000);
  };
  
  // Function to handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !commentContent.trim()) {
      setError("Please enter both name and comment");
      return;
    }
    
    // Check for basic XSS attempts and block them (simulating CSP)
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i
    ];
    
    if (xssPatterns.some(pattern => pattern.test(commentContent))) {
      setError("Direct script tags and event handlers are blocked by CSP!");
      return;
    }
    
    // Add new comment
    const newComment = {
      id: comments.length + 1,
      name: userName,
      content: commentContent,
      date: new Date().toISOString(),
      isAdmin: false
    };
    
    setComments([...comments, newComment]);
    setSuccess("Comment posted successfully!");
    
    // Clear form
    setUserName("");
    setCommentContent("");
    setError("");
    
    // Simulate admin visiting and viewing the comments
    simulateAdminVisit();
  };
  
  // Function to evaluate comments for CSP bypass attempts
  const evaluateComments = () => {
    if (!adminVisited) return;
    
    // This is the vulnerable part - it uses eval() on user content
    // which can be exploited despite CSP if 'unsafe-eval' is allowed
    comments.forEach(comment => {
      try {
        // Simulate the CSP environment:
        // - Block direct <script> tags (already filtered above)
        // - Allow eval() due to 'unsafe-eval' in CSP
        
        // The vulnerability: content might contain code that can be eval'd
        // For example: "); alert(document.cookie); //
        
        // Simulate rendering comment in a way that might lead to eval execution
        const simulatedRender = `
          renderComment("${comment.content}");
        `;
        
        // Check if the comment is attempting to execute code
        if (simulatedRender.includes('document.cookie') ||
            simulatedRender.includes('alert(') ||
            simulatedRender.includes('console.log(')) {
          
          // Record the execution attempt
          setCodeExecutionHistory(prev => [...prev, `Executed from comment #${comment.id}: ${comment.content}`]);
          
          // If cookie access is attempted, consider it a successful exploit
          if (simulatedRender.includes('document.cookie')) {
            setExecutedCode(comment.content);
            setShowFlag(true);
          }
        }
      } catch (err) {
        // Execution error, but we don't expose this to the user
        console.error("Error in comment evaluation:", err);
      }
    });
  };
  
  // Reset the challenge
  const handleReset = () => {
    setCommentContent("");
    setUserName("");
    setComments([]);
    setExecutedCode(null);
    setShowFlag(false);
    setError("");
    setSuccess("");
    setAdminVisited(false);
    setCodeExecutionHistory([]);
  };
  
  // Hint for successful exploitation
  const getExploitHint = () => {
    if (codeExecutionHistory.length >= 2) {
      return `Try a comment like: "); alert(document.cookie); //`;
    }
    return null;
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
          <h1 className="text-2xl font-bold">CSP Bypass Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Secure Comment System</CardTitle>
              <Badge variant="outline" className="flex items-center">
                <Shield className="h-3 w-3 mr-1" /> CSP Protected
              </Badge>
            </div>
            <CardDescription>
              Leave a comment on our secure platform
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
                <AlertTitle>CSP Bypass Successful!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully bypassed the Content Security Policy and accessed the admin cookie!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/14/submit`}>
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
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="comment">Your Comment</Label>
                  <Textarea
                    id="comment"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Enter your comment"
                    rows={4}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Post Comment</Button>
                </div>
              </form>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-4">Comments</h3>
                
                {/* Admin comment */}
                <div className="space-y-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">Admin</span>
                        <Badge className="ml-2 bg-yellow-500">Admin</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <p>
                      Welcome to our secure comment system! We've implemented a strong Content 
                      Security Policy to protect against XSS attacks. Feel free to leave a comment!
                    </p>
                  </div>
                </div>
                
                {/* User comments */}
                {comments.map((comment) => (
                  <div key={comment.id} className="border p-4 rounded-md mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span className="font-medium">{comment.name}</span>
                        {comment.isAdmin && <Badge className="ml-2">Admin</Badge>}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.date).toLocaleTimeString()}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="security" className="mb-6">
          <TabsList>
            <TabsTrigger value="security">Security Headers</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="learn">Learn More</TabsTrigger>
          </TabsList>
          
          <TabsContent value="security">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Security Headers</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Content-Security-Policy:</p>
                    <div className="bg-gray-100 p-3 rounded-md mt-1 overflow-x-auto">
                      <code className="text-xs">{CSP_HEADER}</code>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">HTTP Headers:</p>
                    <div className="bg-gray-100 p-3 rounded-md mt-1">
                      <code className="text-xs block">X-Frame-Options: DENY</code>
                      <code className="text-xs block">X-XSS-Protection: 1; mode=block</code>
                      <code className="text-xs block">X-Content-Type-Options: nosniff</code>
                      <code className="text-xs block">Referrer-Policy: strict-origin-when-cross-origin</code>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Cookies:</p>
                    <div className="bg-gray-100 p-3 rounded-md mt-1">
                      <code className="text-xs block">{ADMIN_COOKIE.name}=****** (httpOnly: {ADMIN_COOKIE.httpOnly.toString()}, secure: {ADMIN_COOKIE.secure.toString()}, sameSite: {ADMIN_COOKIE.sameSite})</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Look for any dangerous directives in the CSP header</li>
                  <li>The comment system might be vulnerable to code injection</li>
                  <li>Some directives like 'unsafe-eval' can allow JavaScript execution despite CSP</li>
                  <li>The way comments are rendered might allow for escaping strings</li>
                  <li>Try to close existing strings and inject your own code</li>
                  {getExploitHint() && <li className="text-blue-600">{getExploitHint()}</li>}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learn">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Content Security Policy (CSP)</h3>
                <p className="mb-4">
                  Content Security Policy is an added layer of security that helps detect and mitigate certain types
                  of attacks, including Cross-Site Scripting (XSS) and data injection attacks. CSP works by specifying
                  which content sources are considered trusted, and instructing the browser to only execute or render
                  resources from those sources.
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="common-directives">
                    <AccordionTrigger>Common CSP Directives</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">default-src</p>
                          <p className="text-sm">Fallback for other resource types when they don't have policies of their own</p>
                        </div>
                        <div>
                          <p className="font-medium">script-src</p>
                          <p className="text-sm">Valid sources for JavaScript</p>
                        </div>
                        <div>
                          <p className="font-medium">style-src</p>
                          <p className="text-sm">Valid sources for stylesheets</p>
                        </div>
                        <div>
                          <p className="font-medium">img-src</p>
                          <p className="text-sm">Valid sources for images</p>
                        </div>
                        <div>
                          <p className="font-medium">connect-src</p>
                          <p className="text-sm">Valid targets for fetch, XMLHttpRequest, WebSocket</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="dangerous-directives">
                    <AccordionTrigger>Dangerous CSP Directives</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium">'unsafe-inline'</p>
                          <p className="text-sm">Allows inline JavaScript and CSS, which can lead to XSS if user input is reflected</p>
                        </div>
                        <div>
                          <p className="font-medium">'unsafe-eval'</p>
                          <p className="text-sm">Allows the use of eval() and similar methods, which can execute arbitrary code</p>
                        </div>
                        <div>
                          <p className="font-medium">data: URIs</p>
                          <p className="text-sm">Can be abused to include malicious script content</p>
                        </div>
                        <div>
                          <p className="font-medium">Wildcard (*)</p>
                          <p className="text-sm">Allows resources from any origin, potentially including malicious ones</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="best-practices">
                    <AccordionTrigger>CSP Best Practices</AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use strict CSP without unsafe-inline or unsafe-eval</li>
                        <li>Use nonces or hashes instead of unsafe-inline</li>
                        <li>Avoid using wildcards (*) in source directives</li>
                        <li>Implement CSP in report-only mode before enforcement</li>
                        <li>Use strict-dynamic for modern applications</li>
                        <li>Regular audit and update of CSP rules</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {comments.length} comments posted
                {adminVisited && !showFlag && " - Admin has visited but no successful exploits yet"}
                {codeExecutionHistory.length > 0 && !showFlag && " - Some code execution detected!"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
