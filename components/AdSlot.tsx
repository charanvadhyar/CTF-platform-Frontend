"use client"

import { useEffect, useRef } from "react"

interface AdSlotProps {
  position: "top" | "bottom" | "sidebar" | "banner"
  adCode?: string
  className?: string
}

// Hard-coded ad codes for each position
const AD_CODES = {
  top: `<script type="text/javascript">
	atOptions = {
		'key' : '16d1eb874261c3ac6dd03a5624272dce',
		'format' : 'iframe',
		'height' : 250,
		'width' : 300,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/16d1eb874261c3ac6dd03a5624272dce/invoke.js"></script>`,
  
  bottom: `<script type="text/javascript">
	atOptions = {
		'key' : '5fae580fc3d88c905c640069f681d1a2',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/5fae580fc3d88c905c640069f681d1a2/invoke.js"></script>`,
  
  sidebar: `<script type="text/javascript">
	atOptions = {
		'key' : '6ce1db0d62937f6bbcfd956806c8afbc',
		'format' : 'iframe',
		'height' : 600,
		'width' : 160,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/6ce1db0d62937f6bbcfd956806c8afbc/invoke.js"></script>`,
  
  banner: `<script type="text/javascript">
	atOptions = {
		'key' : 'd7f30a58bb6a3c3e49c99290d8a23a34',
		'format' : 'iframe',
		'height' : 90,
		'width' : 728,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/d7f30a58bb6a3c3e49c99290d8a23a34/invoke.js"></script>`
};

export default function AdSlot({ position, adCode = "", className = "" }: AdSlotProps) {
  // Use the provided adCode if available, otherwise use the default for the position
  const finalAdCode = adCode || AD_CODES[position] || ""
  const adContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(`AdSlot - Rendering ad for position: ${position}`)
    console.log(`AdSlot - Using direct ad code for ${position}`)
  }, [position])

  // Execute ad scripts when the component mounts and adCode is available
  useEffect(() => {
    if (!finalAdCode || !adContainerRef.current) return
    
    console.log('Executing ad scripts for position:', position)
    
    // Function to execute scripts in the adCode
    const executeScripts = () => {
      try {
        // Parse the HTML content
        const parser = new DOMParser()
        const doc = parser.parseFromString(finalAdCode, 'text/html')
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
  }, [finalAdCode, position])
  
  // Don't render anything if there's no ad code
  if (!finalAdCode) {
    return null
  }

  const getPositionClasses = () => {
    const baseClasses = "overflow-hidden rounded-lg border border-gray-200 bg-gray-50"

    switch (position) {
      case "top":
        return `w-[300px] h-[250px] mx-auto mb-6 ${baseClasses}`
      case "bottom":
        return `w-[320px] h-[50px] mx-auto mt-6 ${baseClasses}`
      case "sidebar":
        return `fixed right-4 top-1/2 transform -translate-y-1/2 w-[160px] h-[600px] z-20 hidden lg:block ${baseClasses}`
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
        dangerouslySetInnerHTML={{ __html: finalAdCode }}
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
