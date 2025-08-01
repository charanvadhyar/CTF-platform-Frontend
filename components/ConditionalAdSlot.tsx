"use client"

import { usePathname } from 'next/navigation'
import AdSlot from './AdSlot'

interface ConditionalAdSlotProps {
  position: "top" | "bottom" | "sidebar" | "banner"
  className?: string
}

/**
 * Conditionally renders ad slots only on non-landing pages
 * Completely removes the ad slots (including containers and spacing) on the landing page
 */
export default function ConditionalAdSlot({ position, className }: ConditionalAdSlotProps) {
  const pathname = usePathname()
  
  // Don't show ads on the landing page (root route)
  if (pathname === '/') {
    return null
  }
  
  // We don't need to pass adCode - AdSlot will use its default codes based on position
  return <AdSlot position={position} className={className} adCode="" />
}
