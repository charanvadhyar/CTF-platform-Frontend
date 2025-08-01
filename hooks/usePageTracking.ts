"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useUser } from "@/lib/userContext"

export function usePageTracking() {
  const pathname = usePathname()
  const { trackPageView } = useUser()

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname, trackPageView])
}
