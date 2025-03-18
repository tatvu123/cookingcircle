"use client"

import { useState, useEffect } from "react"
import { Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/db"

interface CollectButtonProps {
  recipeId: string
  userId?: string
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
}

export function CollectButton({ 
  recipeId, 
  userId, 
  variant = "ghost", 
  size = "sm" 
}: CollectButtonProps) {
  const [isCollected, setIsCollected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Check if recipe is already collected
  useEffect(() => {
    if (!userId) return
    
    async function checkIfCollected() {
      try {
        const { data, error } = await supabaseClient
          .from('recipe_collections')
          .select('collection_id')
          .eq('recipe_id', recipeId)
          .eq('user_id', userId)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking collection status:', error)
          return
        }
        
        setIsCollected(!!data)
      } catch (error) {
        console.error('Error checking collection status:', error)
      }
    }
    
    checkIfCollected()
  }, [recipeId, userId])
  
  const handleCollect = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to collect recipes",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isCollected) {
        // Remove from collection
        const { error } = await supabaseClient
          .from('recipe_collections')
          .delete()
          .eq('recipe_id', recipeId)
          .eq('user_id', userId)
        
        if (error) throw error
        
        setIsCollected(false)
        toast({
          title: "Recipe removed",
          description: "This recipe has been removed from your collection"
        })
      } else {
        // Add to collection
        const { error } = await supabaseClient
          .from('recipe_collections')
          .insert({
            recipe_id: recipeId,
            user_id: userId
          })
        
        if (error) throw error
        
        setIsCollected(true)
        toast({
          title: "Recipe collected",
          description: "This recipe has been added to your collection"
        })
      }
    } catch (error) {
      console.error('Error toggling collection:', error)
      toast({
        title: "Error",
        description: "Failed to update collection. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleCollect}
      disabled={isLoading}
      className={`gap-1 ${isCollected ? "text-primary" : ""}`}
    >
      <Bookmark className={`h-4 w-4 ${isCollected ? "fill-current" : ""}`} />
      <span className="ml-1">{isCollected ? "Collected" : "Collect"}</span>
    </Button>
  )
} 