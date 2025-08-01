"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChallengeLayout from "@/components/ChallengeLayout";
import { ArrowLeft, Flag, Upload, AlertCircle, File, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Challenge description
const CHALLENGE_DESCRIPTION = `
## File Upload Abuse Challenge

You've discovered a simple file upload functionality on a company's website. Your goal is to bypass the file upload restrictions to upload a malicious file and gain unauthorized access.

### Hints:
- Look at how file type validation is implemented
- Check for client-side vs server-side validation
- Try to manipulate file extensions or MIME types
- Look for ways to bypass the restrictions
`;

// Flag for this challenge
const FLAG = "CTF{bypass_upload_filters_for_rce}";

// Allowed mime types and extensions (as far as user is told)
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif"];

// Rules that are checked (some are client-side only and can be bypassed)
const VALIDATION_RULES = [
  { name: "File extension check", description: "Only image files (.jpg, .png, .gif) are allowed", bypassable: true },
  { name: "File size limit", description: "Maximum file size: 2MB", bypassable: false },
  { name: "MIME type check", description: "Only image MIME types are allowed", bypassable: true },
  { name: "Content check", description: "File content is verified to match the extension", bypassable: false },
  { name: "Malware scan", description: "Files are scanned for known malicious patterns", bypassable: true }
];

export default function FileUploadAbuseChallenge() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileExtension, setFileExtension] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    
    const file = e.target.files[0];
    setSelectedFile(file);
    setFileSize(file.size);
    setFileType(file.type);
    
    // Get file extension
    const name = file.name;
    const lastDot = name.lastIndexOf('.');
    const ext = lastDot !== -1 ? name.substring(lastDot).toLowerCase() : '';
    setFileExtension(ext);
    
    // Reset states
    setError("");
    setSuccess(false);
  };
  
  // Simulated client-side validation (deliberately vulnerable)
  const validateFile = () => {
    if (!selectedFile) {
      setError("No file selected");
      return false;
    }
    
    // Check file size (this check is server-side and cannot be bypassed)
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit");
      return false;
    }
    
    // Client-side extension check (can be bypassed)
    if (!ALLOWED_EXTENSIONS.some(ext => selectedFile.name.toLowerCase().endsWith(ext))) {
      setError("Invalid file extension. Only .jpg, .jpeg, .png, and .gif files are allowed");
      return false;
    }
    
    // Client-side MIME type check (can be bypassed)
    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      setError("Invalid file type. Only image files are allowed");
      return false;
    }
    
    return true;
  };
  
  // Handle file upload
  const handleUpload = () => {
    // Perform client-side validation
    if (!validateFile()) {
      return;
    }
    
    setIsUploading(true);
    setCurrentProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          simulateServerValidation();
          return 100;
        }
        return next;
      });
    }, 200);
  };
  
  // Simulated server-side validation (deliberately vulnerable to extension bypass)
  const simulateServerValidation = () => {
    setTimeout(() => {
      // The vulnerability: server-side validation only checks if the name CONTAINS 
      // an allowed extension, not if it ENDS with one. This is the vulnerability to exploit.
      const hasAllowedExtension = ALLOWED_EXTENSIONS.some(ext => 
        selectedFile!.name.toLowerCase().includes(ext.toLowerCase())
      );
      
      if (!hasAllowedExtension) {
        setError("Server rejected the file: invalid file type");
        setIsUploading(false);
        return;
      }
      
      // Size check is properly implemented server-side
      if (selectedFile!.size > 2 * 1024 * 1024) {
        setError("Server rejected the file: exceeds size limit");
        setIsUploading(false);
        return;
      }
      
      // Check for "malicious" extensions - this is what we want them to bypass
      const dangerousExts = [".php", ".js", ".exe", ".jsp", ".asp", ".aspx", ".py"];
      const fileNameLower = selectedFile!.name.toLowerCase();
      
      // The vulnerability: if the filename contains both a dangerous extension AND an allowed extension
      // e.g. "exploit.php.jpg", it will pass validation
      const hasDangerousExt = dangerousExts.some(ext => fileNameLower.endsWith(ext));
      
      // Create uploaded file entry
      const newFile = {
        id: uploadedFiles.length + 1,
        name: selectedFile!.name,
        type: selectedFile!.type,
        size: selectedFile!.size,
        timestamp: new Date().toISOString(),
        isDangerous: hasDangerousExt
      };
      
      setUploadedFiles([...uploadedFiles, newFile]);
      setIsUploading(false);
      
      // Success state
      setSuccess(true);
      
      // If a dangerous file was uploaded successfully, show the flag
      if (hasDangerousExt) {
        setShowFlag(true);
      }
      
      // Reset file selection
      setSelectedFile(null);
      setFileSize(0);
      setFileType("");
      setFileExtension("");
      
      // Reset form
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }, 1000);
  };
  
  // Reset the challenge
  const handleReset = () => {
    setSelectedFile(null);
    setFileSize(0);
    setFileType("");
    setFileExtension("");
    setUploadedFiles([]);
    setError("");
    setSuccess(false);
    setShowFlag(false);
    setCurrentProgress(0);
    setIsUploading(false);
    
    // Reset form
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
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
          <h1 className="text-2xl font-bold">File Upload Abuse Challenge</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Picture Upload</CardTitle>
            <CardDescription>
              Upload a new profile picture for your account
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
                <AlertDescription>
                  File uploaded successfully!
                </AlertDescription>
              </Alert>
            )}
            
            {showFlag && (
              <Alert className="mb-6 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Exploit Successful!</AlertTitle>
                <AlertDescription>
                  <p>You've successfully bypassed the upload restrictions and uploaded a potentially malicious file!</p>
                  <p className="mt-2">The flag is: <code className="bg-green-200 p-1 rounded">{FLAG}</code></p>
                  <div className="mt-4">
                    <Link href={`/challenges/11/submit`}>
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
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4">Upload a new image</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file-upload" className="mb-2 block">Select file</Label>
                    <Input 
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium mb-2">File details:</h4>
                      <p className="text-sm"><strong>Name:</strong> {selectedFile.name}</p>
                      <p className="text-sm"><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB</p>
                      <p className="text-sm"><strong>Type:</strong> {selectedFile.type || "Not specified"}</p>
                      <p className="text-sm"><strong>Extension:</strong> {fileExtension}</p>
                    </div>
                  )}
                  
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{currentProgress}%</span>
                      </div>
                      <Progress value={currentProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>
                </div>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Uploaded files</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Filename</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell>{file.id}</TableCell>
                          <TableCell className="font-mono text-xs">{file.name}</TableCell>
                          <TableCell>{file.type || "Unknown"}</TableCell>
                          <TableCell>{(file.size / 1024).toFixed(1)} KB</TableCell>
                          <TableCell>
                            {file.isDangerous ? (
                              <Badge className="bg-red-500">Malicious</Badge>
                            ) : (
                              <Badge className="bg-green-500">Safe</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="allowed" className="mb-6">
          <TabsList>
            <TabsTrigger value="allowed">Allowed Files</TabsTrigger>
            <TabsTrigger value="validation">Validation Rules</TabsTrigger>
            <TabsTrigger value="hints">Hints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allowed">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Allowed File Types</h3>
                <p className="mb-4">
                  This upload system only accepts image files with the following specifications:
                </p>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Allowed Extensions:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ALLOWED_EXTENSIONS.map((ext, i) => (
                        <Badge key={i} variant="outline">
                          <code>{ext}</code>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Allowed MIME Types:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {ALLOWED_MIME_TYPES.map((mime, i) => (
                        <Badge key={i} variant="outline">
                          <code>{mime}</code>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium">Size Limit:</p>
                    <p>Maximum file size: 2MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="validation">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Validation Process</h3>
                <p className="mb-4">
                  Files go through the following validation checks before being accepted:
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Check</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Where</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {VALIDATION_RULES.map((rule, i) => (
                      <TableRow key={i}>
                        <TableCell>{rule.name}</TableCell>
                        <TableCell>{rule.description}</TableCell>
                        <TableCell>
                          <Badge variant={rule.bypassable ? "outline" : "secondary"}>
                            {rule.bypassable ? "Client-side" : "Server-side"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hints">
            <Card>
              <CardContent className="pt-6">
                <p>Hints:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Client-side validations can often be bypassed</li>
                  <li>The server might validate files differently than the client</li>
                  <li>Try using double extensions like "filename.php.jpg"</li>
                  <li>Some validation checks only look for the presence of allowed extensions, not their position</li>
                  <li>Think about how to make a file look like an image but actually contain executable code</li>
                  <li>Upload restrictions often focus on extension and MIME type, but these can be manipulated</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card>
          <CardContent className="pt-6 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                {uploadedFiles.length} files uploaded
                {uploadedFiles.length > 0 && !showFlag && " - Try uploading a file with a dangerous extension (.php, .js, etc.)"}
              </p>
            </div>
            <Button onClick={handleReset} variant="outline">Reset Challenge</Button>
          </CardContent>
        </Card>
      </div>
    </ChallengeLayout>
  );
}
