"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Bypass Login Challenge

You're presented with a login page for a fictional company's admin panel. Your task is to bypass the authentication and gain access to the admin area without knowing the correct credentials.

### Hints:
- Sometimes, insecure authentication logic can be exploited without SQL injection
- Look at how the form data is processed in the client side
- Try different combinations and pay attention to any client-side validation
`;

// Flag for this challenge (same as in backend)
const FLAG = "CTF{insecure_auth_logic_bypass}";

export default function BypassLoginChallenge() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  
  // Form schema
  const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });
  
  const handleLogin = (data: z.infer<typeof formSchema>) => {
    setError("");
    setAttempts(attempts + 1);
    
    // Intentionally vulnerable client-side authentication logic
    if (data.username === "admin" && data.password === "admin") {
      setIsAuthenticated(true);
      return;
    }
    
    // Vulnerable OR condition (the exploit)
    if (data.username === "admin" || data.password === "admin123") {
      setIsAuthenticated(true);
      return;
    }
    
    setError("Invalid credentials. Please try again.");
  };
  
  // Successful authentication view
  if (isAuthenticated) {
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
            <h1 className="text-2xl font-bold">Bypass Login - Success!</h1>
          </div>
          
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle className="text-green-700">Authentication Bypassed!</AlertTitle>
            <AlertDescription className="text-green-600">
              Congratulations! You've successfully bypassed the login authentication.
            </AlertDescription>
          </Alert>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Welcome to the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded bg-slate-50">
                <h3 className="text-lg font-medium mb-4">Restricted Content</h3>
                <p className="mb-4">You have successfully bypassed authentication and gained access to the admin panel.</p>
                <div className="bg-yellow-100 border border-yellow-300 p-3 rounded text-yellow-800">
                  <p className="font-mono text-sm">The flag for this challenge is: {FLAG}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/challenges/1/submit`}>
                <Button className="flex items-center space-x-2">
                  <Flag className="h-4 w-4 mr-2" />
                  <span>Submit Your Flag</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </ChallengeLayout>
    );
  }
  
  // Login form view
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
          <h1 className="text-2xl font-bold">Bypass Login Challenge</h1>
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
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>SecureCorp Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-700">Authentication Failed</AlertTitle>
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username"
                  placeholder="Enter username" 
                  {...form.register("username")}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Enter password" 
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            {attempts > 0 && (
              <p>Login attempts: {attempts}</p>
            )}
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link href={`/challenges/1/submit`}>
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
