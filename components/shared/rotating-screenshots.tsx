"use client"

import { useState, useEffect } from 'react'

interface Screenshot {
  id: number
  src: string
  alt: string
  title: string
  description: string
}

const screenshots: Screenshot[] = [
  {
    id: 1,
    src: "/images/compressed-json-formatter-screen.webp",
    alt: "JSON Formatter Tool - Format and validate JSON data with syntax highlighting",
    title: "JSON Formatter",
    description: "Format, validate, and beautify JSON data with syntax highlighting and error detection"
  },
  {
    id: 2,
    src: "/images/compressed-regex-tester.webp",
    alt: "Regex Tester Tool - Test and debug regular expressions with real-time matching",
    title: "Regex Tester",
    description: "Test, debug, and optimize regular expressions with real-time matching and explanation"
  },
  {
    id: 3,
    src: "/images/compressed-jwt-decoder-screen.webp",
    alt: "JWT Decoder Tool - Decode and verify JSON Web Tokens",
    title: "JWT Decoder",
    description: "Decode, verify, and inspect JSON Web Tokens with detailed payload analysis"
  },
  {
    id: 4,
    src: "/images/compressed-compress-image-screen.webp",
    alt: "Image Compressor Tool - Compress images while maintaining quality",
    title: "Image Compressor",
    description: "Compress images to reduce file size while maintaining visual quality"
  },
  {
    id: 5,
    src: "/images/compressed-world-clock-screen.webp",
    alt: "World Clock Tool - View time across multiple timezones",
    title: "World Clock",
    description: "Track time across multiple timezones with a beautiful, interactive interface"
  },
  {
    id: 6,
    src: "/images/compressed-xpath-tester-screen.webp",
    alt: "XPath Tester Tool - Test XPath expressions on HTML/XML documents",
    title: "XPath Tester",
    description: "Test XPath and CSS selectors on HTML/XML documents with real-time results"
  },
  {
    id: 7,
    src: "/images/compressed-pwa-asset-manager-screen.webp",
    alt: "PWA Asset Manager Tool - Generate PWA icons and manifest files",
    title: "PWA Asset Manager",
    description: "Generate Progressive Web App icons, manifest files, and splash screens"
  },
  {
    id: 8,
    src: "/images/compressed-base64-encoder-screen.webp",
    alt: "Base64 Encoder Tool - Encode and decode Base64 data",
    title: "Base64 Encoder",
    description: "Encode text to Base64 and decode Base64 data with support for files and images"
  }
]

export function RotatingScreenshots() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % screenshots.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[400px] lg:h-[450px]">
      {/* Main Screenshot Display */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        {screenshots.map((screenshot, index) => (
          <div
            key={screenshot.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={screenshot.src}
                alt={screenshot.alt}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            </div>
            {/* Overlay with tool name and description */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <h3 className="text-white text-xl font-semibold mb-2">{screenshot.title}</h3>
              <p className="text-white/90 text-sm leading-relaxed">{screenshot.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to screenshot ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next Buttons */}
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
        aria-label="Previous screenshot"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % screenshots.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all duration-300"
        aria-label="Next screenshot"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Floating Badge */}
      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {currentIndex + 1} of {screenshots.length}
      </div>
    </div>
  )
}
