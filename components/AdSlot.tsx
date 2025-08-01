"use client"

import { useEffect, useState, useRef } from "react"

interface AdSlotProps {
  position: "top" | "bottom" | "sidebar" | "banner"
  className?: string
}

export default function AdSlot({ position, className = "" }: AdSlotProps) {
  const [adCode, setAdCode] = useState<string>("")
  const [isActive, setIsActive] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const adContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAdConfig()
  }, [position])

  const loadAdConfig = async () => {
    try {
      setIsLoading(true)
      console.log(`AdSlot - Loading ad for position: ${position}`)
      const response = await fetch(`/api/ads?position=${position}`)

      if (response.ok) {
        const adData = await response.json()
        console.log(`AdSlot - Received ad data for ${position}:`, adData)
        console.log(`AdSlot - Raw ad code content:`, adData.code)
        setAdCode(adData.code || "")
        setIsActive(adData.active || false)
      } else {
        console.log(`AdSlot - Failed to load ad from API, status: ${response.status}`)
        // Fallback to localStorage for offline functionality
        const storedAds = localStorage.getItem("adConfig")
        if (storedAds) {
          const ads = JSON.parse(storedAds)
          const ad = ads.find((a: any) => a.position === position)
          if (ad) {
            console.log(`AdSlot - Using localStorage fallback for ${position}`)
            setAdCode(ad.code || "")
            setIsActive(ad.active || false)
          }
        }
      }
    } catch (error) {
      console.error(`Error loading ad for position ${position}:`, error)
      setIsActive(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't render anything if ad is not active, has no code, or is still loading
  if (!isActive || !adCode || isLoading) {
    return null
  }
  
  // Execute ad scripts when the component mounts and adCode is available
  useEffect(() => {
    if (!adCode || !isActive || isLoading || !adContainerRef.current) return
    
    console.log('Executing ad scripts for position:', position)
    
    // Function to execute scripts in the adCode
    const executeScripts = () => {
      try {
        // Parse the HTML content
        const parser = new DOMParser()
        const doc = parser.parseFromString(adCode, 'text/html')
        const scripts = doc.querySelectorAll('script')
        
        // Execute each script
        scripts.forEach(script => {
          const newScript = document.createElement('script')
          
          // Copy script attributes
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value)
          })
          
          // Copy script content
          if (script.innerHTML) {
            newScript.innerHTML = script.innerHTML
          }
          
          // Insert the new script into DOM
          adContainerRef.current?.appendChild(newScript)
          console.log('Script executed:', script.src || 'inline script')
        })
        
        console.log(`${scripts.length} scripts executed for ad position: ${position}`)
      } catch (error) {
        console.error('Error executing ad scripts:', error)
      }
    }
    
    // Execute scripts with a small delay to ensure DOM is ready
    setTimeout(executeScripts, 100)
  }, [adCode, isActive, isLoading, position])

  const getPositionClasses = () => {
    const baseClasses = "overflow-hidden rounded-lg border border-gray-200 bg-gray-50"

    switch (position) {
      case "top":
        return `w-full min-h-[100px] max-h-[200px] mb-6 ${baseClasses}`
      case "bottom":
        return `w-full min-h-[100px] max-h-[200px] mt-6 ${baseClasses}`
      case "sidebar":
        return `fixed right-4 top-1/2 transform -translate-y-1/2 w-40 h-80 z-20 hidden lg:block ${baseClasses}`
      case "banner":
        return `w-full min-h-[120px] max-h-[250px] my-6 ${baseClasses}`
      default:
        return baseClasses
    }
  }

  return (
    <div className={`${getPositionClasses()} ${className}`}>
      {/* First div for displaying the HTML content */}
      <div
        className="w-full h-full flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: adCode }}
        style={{
          // Additional safety measures
          maxWidth: "100%",
          maxHeight: "100%",
        }}
      />
      {/* Second hidden div that will hold the executed scripts */}
      <div 
        ref={adContainerRef} 
        className="hidden" 
        data-ad-position={position}
      />
    </div>
  )
}
