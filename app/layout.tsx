import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { UserProvider } from "@/lib/userContext"
import PageTracker from "@/components/PageTracker"
import AdContainer from "@/components/AdContainer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CTF Challenge Platform",
  description: "Test your cybersecurity skills with our CTF challenges",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Navbar />
          <PageTracker />
          <main className="w-full">
            <AdContainer>
              {/* Main content */}
              {children}
            </AdContainer>
          </main>
        </UserProvider>
      </body>
    </html>
  )
}
