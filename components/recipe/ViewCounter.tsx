"use client"

import { useState, useEffect } from "react"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRecipeViewCount, formatViewCount } from "@/lib/recipe-view-service"

interface ViewCounterProps {
  recipeId: string
  initialCount?: number
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
}

export function ViewCounter({ 
  recipeId, 
  initialCount = 0,
  variant = "ghost", 
  size = "sm" 
}: ViewCounterProps) {
  const [viewCount, setViewCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function fetchViewCount() {
      try {
        setIsLoading(true)
        const count = await getRecipeViewCount(recipeId)
        setViewCount(count)
      } catch (error) {
        console.error('Error fetching view count:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchViewCount()
  }, [recipeId])
  
  const formattedCount = formatViewCount(viewCount)
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      className="gap-1"
      disabled
    >
      <Eye className="h-4 w-4" />
      <span className="ml-1">
        {isLoading ? "..." : formattedCount}
      </span>
    </Button>
  )
} 