"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/db"

interface LikeButtonProps {
  recipeId: string
  userId?: string
  initialCount?: number
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
}

export function LikeButton({ 
  recipeId, 
  userId, 
  initialCount = 0,
  variant = "ghost", 
  size = "sm" 
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if recipe is already liked
  useEffect(() => {
    if (!userId) return
    
    async function checkIfLiked() {
      try {
        const { data, error } = await supabaseClient
          .from('recipe_likes')
          .select('like_id')
          .eq('recipe_id', recipeId)
          .eq('user_id', userId)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking like status:', error)
          return
        }
        
        setIsLiked(!!data)
      } catch (error) {
        console.error('Error checking like status:', error)
      }
    }
    
    checkIfLiked()
  }, [recipeId, userId])
  
  // Get current likes count
  useEffect(() => {
    async function getLikesCount() {
      try {
        const { data, error } = await supabaseClient
          .from('recipes')
          .select('likes_count')
          .eq('recipe_id', recipeId)
          .single()
        
        if (error) {
          console.error('Error fetching likes count:', error)
          return
        }
        
        setLikesCount(data?.likes_count || initialCount)
      } catch (error) {
        console.error('Error fetching likes count:', error)
      }
    }
    
    getLikesCount()
  }, [recipeId, initialCount])
  
  const handleLike = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like recipes",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabaseClient
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', userId)
        
        if (error) throw error
        
        setIsLiked(false)
        setLikesCount(prev => Math.max(0, prev - 1))
      } else {
        // Add like
        const { error } = await supabaseClient
          .from('recipe_likes')
          .insert({
            recipe_id: recipeId,
            user_id: userId
          })
        
        if (error) throw error
        
        setIsLiked(true)
        setLikesCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const formattedCount = likesCount > 999 
    ? `${(likesCount / 1000).toFixed(1)}k` 
    : likesCount
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleLike}
      disabled={isLoading}
      className={`gap-1 ${isLiked ? "text-red-500" : ""}`}
    >
      <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      <span className="ml-1">{formattedCount}</span>
    </Button>
  )
} 