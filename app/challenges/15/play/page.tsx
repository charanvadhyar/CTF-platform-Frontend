"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Search, Key, AlertCircle, CheckCircle, Eye, FileCode, LockKeyhole } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## Hardcoded Secrets Challenge

You have access to a web application's frontend code. Your goal is to find sensitive information that has been accidentally exposed in the source code.

### Hints:
- Look for API keys, credentials, or other secrets in the code
- Check for commented out code or debug information
- Examine how authentication is implemented
- Some secrets might be hidden in plain sight
`;

// Flag for this challenge (hidden in the code)
const FLAG = "CTF{h4rdc0d3d_s3cr3ts_4r3_n3v3r_s4f3}";

// Intentionally hardcoded API key (part of the challenge)
const API_KEY = "sk_live_CTF{h4rdc0d3d_s3cr3ts_4r3_n3v3r_s4f3}";

// Hardcoded credentials (part of the challenge)
const CREDENTIALS = {
  username: "admin",
  // TODO: Remember to remove this before production!
  password: "super_secure_password_123"
};

// Database connection string (part of the challenge)
const DB_CONNECTION_STRING = "mongodb://admin:dbpass123@mongodb.example.com:27017/production";

export default function HardcodedSecretsChallenge() {
  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [flagInput, setFlagInput] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  
  // Simulated file structure
  const files = [
    "index.js",
    "auth.js",
    "config.js",
    "api.js",
    "database.js",
    "utils.js",
    "README.md",
    ".env.backup",
    "deploy.sh"
  ];
  
  // File contents with hardcoded secrets
  const fileContents: Record<string, string> = {
    "index.js": `// Main application entry point
import { initAuth } from './auth';
import { setupAPI } from './api';
import { connectDatabase } from './database';

// Initialize the application
async function init() {
  await initAuth();
  await setupAPI();
  await connectDatabase();
  console.log('Application started successfully!');
}

init().catch(err => {
  console.error('Failed to start application:', err);
});
`,
    "auth.js": `// Authentication module
import { API_KEY } from './config';

// User credentials
const adminCredentials = {
  username: 'admin',
  // TODO: Remember to remove this before production!
  password: 'super_secure_password_123'
};

export async function initAuth() {
  console.log('Initializing authentication system...');
  // Authentication logic here
}

export async function login(username, password) {
  // For testing, allow direct login with admin credentials
  if (username === adminCredentials.username && 
      password === adminCredentials.password) {
    return { success: true, token: 'admin_token_123' };
  }
  return { success: false, error: 'Invalid credentials' };
}
`,
    "config.js": `// Configuration settings
// API Keys
export const API_KEY = 'sk_live_CTF{h4rdc0d3d_s3cr3ts_4r3_n3v3r_s4f3}';
export const SANDBOX_API_KEY = 'sk_test_98765432109876543210987654321098';

// Environment settings
export const ENV = 'production';
export const DEBUG = false;

// Feature flags
export const FEATURES = {
  newUserFlow: true,
  advancedReporting: false
};
`,
    "api.js": `// API interaction module
import { API_KEY } from './config';

export async function setupAPI() {
  console.log('Setting up API with key:', API_KEY.substring(0, 10) + '...');
  // API setup logic here
}

export async function makeAPIRequest(endpoint, data) {
  const headers = {
    'Authorization': \`Bearer \${API_KEY}\`,
    'Content-Type': 'application/json'
  };
  
  // API request logic here
  return { success: true, data: {} };
}
`,
    "database.js": `// Database interaction module

// Database connection details
const DB_CONNECTION_STRING = 'mongodb://admin:dbpass123@mongodb.example.com:27017/production';

export async function connectDatabase() {
  console.log('Connecting to database...');
  // Connection logic using DB_CONNECTION_STRING
  return true;
}

export async function query(sql) {
  // Database query logic here
  return [];
}
`,
    "utils.js": `// Utility functions

export function formatDate(date) {
  // Date formatting logic
  return date.toISOString();
}

export function validateInput(input) {
  // Input validation logic
  return input !== null && input !== undefined && input !== '';
}

// JWT signing key (should be in a secure environment variable)
export const JWT_SECRET = '8f7d56a496e435234cc8aad298e9b5d47d8c0b7b';
`,
    "README.md": `# Example Application

This is a sample application for demonstration purposes.

## Setup

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure environment variables (see \`.env.example\`)
4. Start the server: \`npm start\`

## Development

For development, use the test API key instead of the production key.
`,
    ".env.backup": `# Environment Variables Backup
# Created: 2023-05-15

API_KEY=sk_live_CTF{h4rdc0d3d_s3cr3ts_4r3_n3v3r_s4f3}
DB_PASSWORD=dbpass123
ADMIN_PASSWORD=super_secure_password_123
JWT_SECRET=8f7d56a496e435234cc8aad298e9b5d47d8c0b7b

# This is a backup file, do not use in production!
`,
    "deploy.sh": `#!/bin/bash
# Deployment script

# Set environment
export NODE_ENV=production

# Database backup before deployment
mongodump --uri="mongodb://admin:dbpass123@mongodb.example.com:27017/production"

# Deploy application
npm run build
npm run deploy

echo "Deployment completed successfully!"
`
  };
  
  // Search function
  const handleSearch = () => {
    setError("");
    
    if (!searchQuery.trim()) {
      setError("Please enter a search query");
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const results = files.filter(file => {
      // Check if file name matches
      if (file.toLowerCase().includes(query)) {
        return true;
      }
      
      // Check if file content matches
      const content = fileContents[file] || "";
      return content.toLowerCase().includes(query);
    });
    
    setSearchResults(results);
    
    if (results.length === 0) {
      setError("No results found");
    }
  };
  
  // View file content
  const viewFile = (file: string) => {
    setCurrentFile(file);
    setFileContent(fileContents[file] || "File content not available");
  };
  
  // Check flag submission
  const handleFlagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!flagInput.trim()) {
      setError("Please enter the flag");
      return;
    }
    
    if (flagInput === FLAG) {
      setSuccess("Congratulations! You found the correct flag!");
      setShowFlag(true);
    } else {
      setError("Incorrect flag. Try again!");
    }
  };
  
  // Reset challenge
  const handleReset = () => {
    setSearchQuery("");
    setSearchResults([]);
    setCurrentFile(null);
    setFileContent("");
    setError("");
    setSuccess("");
    setFlagInput("");
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
          <h1 className="text-2xl font-bold">Hardcoded Secrets Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Source Code Explorer</CardTitle>
            <CardDescription>
              Search through the application's source code to find sensitive information
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
                <AlertTitle>Challenge Completed!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully found the hardcoded secret in the source code!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/15/submit`}>
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
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search in files (try: password, key, secret, TODO, connection)"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b">
                    <h3 className="text-sm font-medium">Files</h3>
                  </div>
                  <div className="h-[300px] overflow-y-auto p-2">
                    {searchResults.length > 0 ? (
                      <ul className="space-y-1">
                        {searchResults.map((file, i) => (
                          <li key={i}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left"
                              onClick={() => viewFile(file)}
                            >
                              <FileCode className="h-4 w-4 mr-2 text-gray-500" />
                              {file}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">
                          {searchQuery ? "No results found" : "Use the search bar to find files"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="col-span-2 border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                    <h3 className="text-sm font-medium">
                      {currentFile || "File Content"}
                    </h3>
                    {currentFile && (
                      <Badge variant="outline" className="text-xs">
                        {currentFile.split('.').pop()}
                      </Badge>
                    )}
                  </div>
                  <div className="h-[300px] overflow-y-auto">
                    {currentFile ? (
                      <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                        {fileContent}
                      </pre>
                    ) : (
                      <div className="p-4 text-center text-gray-500 h-full flex items-center justify-center">
                        <p>Select a file to view its contents</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <form onSubmit={handleFlagSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="flag">Enter the Flag</Label>
                    <div className="flex mt-1">
                      <div className="relative flex-grow">
                        <Flag className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="flag"
                          placeholder="Format: CTF{...}"
                          className="pl-8"
                          value={flagInput}
                          onChange={(e) => setFlagInput(e.target.value)}
                        />
                      </div>
                      <Button type="submit" className="ml-2">Submit Flag</Button>
                    </div>
                  </div>
                </form>
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
                <h3 className="font-medium mb-2">Hardcoded Secrets Vulnerability</h3>
                <p className="mb-4">
                  Hardcoded secrets in source code are a common security vulnerability where sensitive information
                  such as API keys, passwords, and connection strings are directly embedded in the application code
                  instead of being stored securely in environment variables or a secure vault.
                </p>
                <p>
                  In this challenge, you need to:
                </p>
                <ol className="list-decimal pl-5 space-y-1 mb-4">
                  <li>Search the source code for potential secrets</li>
                  <li>Look for patterns that indicate sensitive information</li>
                  <li>Identify the flag hidden within a hardcoded secret</li>
                  <li>Submit the complete flag to complete the challenge</li>
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Search for common terms like "key", "secret", "password", or "token"</li>
                  <li>Look for commented out code with "TODO" comments</li>
                  <li>Check configuration files and backup files</li>
                  <li>The flag follows the format CTF</li>
                  <li>Sometimes secrets are hidden in plain sight in API keys or configuration values</li>
                  <li>Don't forget to check files that might not seem important at first glance</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="learn">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">About Hardcoded Secrets</h3>
                <p className="mb-4">
                  Hardcoded secrets are a significant security risk because:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><strong>Version Control Exposure</strong>: Once committed to version control, secrets remain in the history even if later removed</li>
                  <li><strong>Wider Access</strong>: Anyone with access to the code (including developers, contractors, etc.) gains access to production secrets</li>
                  <li><strong>Difficult Rotation</strong>: Changing secrets requires code changes instead of simple configuration updates</li>
                  <li><strong>Environment Confusion</strong>: The same secrets may be used across development, testing, and production environments</li>
                </ul>
                <p className="mb-4">
                  Best practices for managing secrets:
                </p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li>Use environment variables for configuration</li>
                  <li>Implement secrets management systems (like HashiCorp Vault, AWS Secrets Manager)</li>
                  <li>Set up pre-commit hooks to detect and prevent secret leakage</li>
                  <li>Use .gitignore to exclude sensitive files</li>
                  <li>Regularly rotate secrets and credentials</li>
                  <li>Implement the principle of least privilege for all credentials</li>
                  <li>Use secret scanning tools in CI/CD pipelines</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {searchResults.length} files found
                {currentFile && !showFlag && " - Keep searching for sensitive information"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
