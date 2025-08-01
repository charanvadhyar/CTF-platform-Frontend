"use client"

import { usePathname } from 'next/navigation'
import AdSlot from './AdSlot'
import { ReactNode } from 'react'

/**
 * AdContainer component that handles ad placement and spacing for the entire site
 * It completely removes itself on the landing page to let the page control its own layout
 */
export default function AdContainer({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/'
  
  // On landing page, just render the children directly with no wrapper at all
  if (isLandingPage) {
    return <>{children}</>
  }
  
  // For other pages, render with ads and proper spacing
  return (
    <div className="relative">
      {/* Top ad */}
      <AdSlot position="top" />
      
      {/* Main content with spacing */}
      <div className="my-6">
        {children}
      </div>
      
      {/* Sidebar ad */}
      <AdSlot position="sidebar" />
      
      {/* Bottom ad */}
      <AdSlot position="bottom" />
    </div>
  )
}
