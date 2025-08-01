import type { ReactNode } from "react"
import AdSlot from "./AdSlot"

interface ChallengeLayoutProps {
  children: ReactNode
  className?: string
}

export default function ChallengeLayout({ children, className = "" }: ChallengeLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Top Ad */}
      <div className="container mx-auto px-4 pt-4">
        <AdSlot position="top" />
      </div>

      {/* Sticky Side Ads */}
      <AdSlot position="left" />
      <AdSlot position="right" />

      {/* Main Content */}
      <div className={`container mx-auto px-4 py-8 ${className}`}>{children}</div>

      {/* Bottom Ad */}
      <div className="container mx-auto px-4 pb-4">
        <AdSlot position="bottom" />
      </div>
    </div>
  )
}
