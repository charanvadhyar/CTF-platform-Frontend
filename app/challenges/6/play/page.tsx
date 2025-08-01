"use client";

import { useState, useEffect } from "react";

// Extend Window interface to include our custom property
declare global {
  interface Window {
    checkPremiumStatus: () => boolean;
  }
}
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Check, AlertCircle, LockIcon, UnlockIcon, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Client-Side Trust Challenge

You've been given a premium content website that uses client-side validation to restrict access to premium features. Your goal is to bypass these restrictions without actually purchasing premium access.

### Hints:
- Look at how the premium status check is implemented
- Client-side code can be viewed and potentially modified
- JavaScript variables can be manipulated through the browser console
- Think about how the application determines if you have premium access
`;

// Flag for this challenge
const FLAG = "CTF{never_trust_client_side_validation}";

export default function ClientSideTrustChallenge() {
  const [isPremium, setIsPremium] = useState(false);
  const [username, setUsername] = useState("guest_user");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });
  const [showFlag, setShowFlag] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState("");

  // Premium features that should be restricted
  const premiumFeatures = [
    "Advanced Analytics",
    "Ad-Free Experience",
    "Exclusive Content",
    "Premium Support",
    "Flag Access"
  ];

  // Check if premium status - deliberately vulnerable by storing it in client-side state
  useEffect(() => {
    // This is intentionally vulnerable
    // In a real application, this would be verified server-side on every request
    window.checkPremiumStatus = () => {
      return isPremium;
    };

    // Load premium status from localStorage (if any)
    const storedStatus = localStorage.getItem("premium_status");
    if (storedStatus === "true") {
      setIsPremium(true);
    }
  }, []);

  // Handle premium purchase
  const handlePurchasePremium = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setShowPaymentForm(false);
    setIsPremium(true);
    // Store in localStorage for persistence
    localStorage.setItem("premium_status", "true");
  };

  // Handle accessing premium feature (including the flag)
  const handleAccessPremiumFeature = (feature: string) => {
    if (!isPremium) {
      setError("You need premium access to use this feature!");
      return;
    }

    if (feature === "Flag Access") {
      setShowFlag(true);
    } else {
      setError(`Successfully accessed: ${feature}`);
    }
  };

  // Reset the challenge
  const handleReset = () => {
    setIsPremium(false);
    setUsername("guest_user");
    setShowPaymentForm(false);
    setShowFlag(false);
    setError("");
    // Clear localStorage
    localStorage.removeItem("premium_status");
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
          <h1 className="text-2xl font-bold">Client-Side Trust Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Premium Content Portal</CardTitle>
              <Badge variant={isPremium ? "default" : "outline"}>
                {isPremium ? "Premium User" : "Free User"}
              </Badge>
            </div>
            <CardDescription>
              Welcome, {username}! {isPremium 
                ? "You have premium access." 
                : "Upgrade to premium to access exclusive content."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Available Features</h3>
              <div className="space-y-3">
                {premiumFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between border p-3 rounded-md">
                    <div className="flex items-center">
                      <div className="mr-2">
                        {isPremium ? (
                          <UnlockIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <LockIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span>{feature}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAccessPremiumFeature(feature)}
                    >
                      Access
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            {showFlag && (
              <Alert className="bg-green-100 text-green-800 border-green-200 mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Premium Feature Unlocked!</AlertTitle>
                <AlertDescription>
                  <p>Congratulations! You've accessed the premium flag feature.</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/6/submit`}>
                      <Button className="flex items-center space-x-2">
                        <Flag className="h-4 w-4 mr-2" />
                        <span>Submit Your Flag</span>
                      </Button>
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {!isPremium && !showPaymentForm && (
              <div className="flex justify-center">
                <Button onClick={() => setShowPaymentForm(true)}>
                  Upgrade to Premium ($9.99/month)
                </Button>
              </div>
            )}
            
            {showPaymentForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>Upgrade to premium for $9.99/month</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePurchasePremium} className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input 
                          id="expiryDate" 
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input 
                          id="cvv" 
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowPaymentForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Purchase Premium
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="hints" className="mb-6">
          <TabsList>
            <TabsTrigger value="hints">Hints</TabsTrigger>
            <TabsTrigger value="inspector">Browser Inspector</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The premium check happens client-side rather than server-side</li>
                  <li>Try inspecting the page and looking at JavaScript variables</li>
                  <li>Open your browser's developer tools (F12) and check the console</li>
                  <li>You can modify JavaScript variables directly in the console</li>
                  {showHint && (
                    <li className="text-blue-600">Try running this in the console: <code>setIsPremium(true)</code> or modifying <code>window.checkPremiumStatus</code></li>
                  )}
                </ul>
                {!showHint && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowHint(true)}>
                    Show Extra Hint
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inspector">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Browser Inspector</h3>
                <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[300px] text-sm">
                  <p className="text-gray-600">Open your browser's Developer Tools (F12) to see:</p>
                  <pre className="text-xs mt-2"><code>{`
// Premium check function (vulnerable)
window.checkPremiumStatus = function() {
  return isPremium; // This variable is controlled client-side!
}

// React component code (simplified)
function ClientSideTrustChallenge() {
  const [isPremium, setIsPremium] = useState(false);
  
  // Check for premium access
  const handleAccessPremiumFeature = (feature) => {
    if (!isPremium) { // Client-side check only!
      setError("You need premium access to use this feature!");
      return;
    }
    
    if (feature === "Flag Access") {
      setShowFlag(true); // Shows the flag if isPremium is true
    }
  }
  
  // ...rest of component
}
                  `}</code></pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex items-center">
              <Button variant="outline" onClick={handleReset}>
                Reset Challenge
              </Button>
              <Separator orientation="vertical" className="mx-4 h-8" />
              <p className="text-sm text-gray-500">
                Try using the browser's developer console to bypass restrictions!
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Hidden comment with a hint */}
        {/* <!-- Hint: Try setting isPremium to true using browser console --> */}
      </div>
    </ChallengeLayout>
  );
}
