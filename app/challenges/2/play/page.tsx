"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## SQL Injection Challenge

You're given access to a product search system for an online store. Your task is to exploit a SQL injection vulnerability in the search functionality to extract sensitive information from the database.

### Hints:
- Try different search inputs that might break the SQL query syntax
- Look for ways to bypass filtering or escape the intended query structure
- Common SQL injection techniques like UNION SELECT might be helpful
`;

// Flag for this challenge (same as in backend)
const FLAG = "CTF{sql_injection_union_attack}";

// Simulated database of products
const PRODUCTS = [
  { id: 1, name: "Laptop", category: "Electronics", price: 999.99 },
  { id: 2, name: "Smartphone", category: "Electronics", price: 699.99 },
  { id: 3, name: "Headphones", category: "Accessories", price: 149.99 },
  { id: 4, name: "Monitor", category: "Electronics", price: 299.99 },
  { id: 5, name: "Keyboard", category: "Accessories", price: 89.99 },
];

// Simulated database of users (hidden from normal search)
const USERS = [
  { id: 1, username: "admin", password: FLAG, email: "admin@example.com" },
  { id: 2, username: "user1", password: "password123", email: "user1@example.com" },
];

export default function SqlInjectionChallenge() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [hasInjection, setHasInjection] = useState(false);
  const [columns, setColumns] = useState<string[]>([]);
  
  const handleSearch = () => {
    setError("");
    
    try {
      // Simulate a vulnerable SQL query
      // This is a frontend simulation of how a backend with SQL injection would behave
      
      // Reset results
      setSearchResults([]);
      setColumns([]);
      
      // Check for SQL injection attempts using UNION
      if (searchQuery.toLowerCase().includes("union") && 
          searchQuery.toLowerCase().includes("select")) {
        
        setHasInjection(true);
        
        // Simulate a successful SQL injection with UNION SELECT
        // In a real scenario, this would come from the backend
        if (searchQuery.toLowerCase().includes("users")) {
          setColumns(["id", "username", "password", "email"]);
          setSearchResults(USERS);
          return;
        }
      }
      
      // Normal search behavior (simulated)
      setColumns(["id", "name", "category", "price"]);
      const filteredProducts = PRODUCTS.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredProducts);
      
    } catch (err) {
      console.error("Search error:", err);
      setError("An error occurred while processing your search.");
    }
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
          <h1 className="text-2xl font-bold">SQL Injection Challenge</h1>
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
            <CardTitle>Product Search</CardTitle>
            <CardDescription>
              Search our product catalog by name or category
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <AlertTitle className="text-red-700">Error</AlertTitle>
                <AlertDescription className="text-red-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex space-x-2 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <Input
                  id="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleSearch} type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="border rounded-md">
              {searchResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result, index) => (
                      <TableRow key={index}>
                        {columns.map((column) => (
                          <TableCell key={`${index}-${column}`}>
                            {result[column]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No products found. Try a different search term.
                </div>
              )}
            </div>
            
            {/* Database Query Simulation */}
            <div className="mt-6 p-3 bg-gray-50 border rounded-md">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">Simulated Database Query:</h3>
              <code className="text-xs p-2 bg-black text-white block rounded overflow-x-auto">
                SELECT id, name, category, price<br/>
                FROM products<br/>
                WHERE name LIKE '%{searchQuery}%'<br/>
                OR category LIKE '%{searchQuery}%'
              </code>
              <p className="mt-2 text-xs text-gray-500">
                <strong>Hint:</strong> Try modifying this query using SQL injection techniques. 
                Remember there are other tables in the database.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <p className="text-sm text-gray-500">
                {hasInjection && searchResults.some(r => r.password === FLAG) && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-700">Success!</AlertTitle>
                    <AlertDescription className="text-green-600">
                      You've successfully exploited the SQL injection vulnerability and found the flag!
                    </AlertDescription>
                  </Alert>
                )}
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link href={`/challenges/2/submit`}>
            <Button className="flex items-center space-x-2">
              <Flag className="h-4 w-4 mr-2" />
              <span>Submit Your Flag</span>
            </Button>
          </Link>
        </div>
      </div>
    </ChallengeLayout>
  );
}
