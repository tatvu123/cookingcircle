"use client"

import { useState, useEffect } from "react"
import { UserPlus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/db"

interface FollowButtonProps {
  userId?: string        // 當前登錄用戶的ID
  profileId: string     // 要關注/取消關注的用戶ID
  initialFollowing?: boolean
  variant?: "ghost" | "outline" | "default"
  size?: "sm" | "default" | "lg"
}

export function FollowButton({ 
  userId, 
  profileId,
  initialFollowing = false,
  variant = "default", 
  size = "sm" 
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  
  // 檢查是否已關注
  useEffect(() => {
    if (!userId) return
    
    async function checkIfFollowing() {
      try {
        const { data, error } = await supabaseClient
          .from('user_follows')
          .select('follow_id')
          .eq('follower_id', userId)
          .eq('following_id', profileId)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error)
          return
        }
        
        setIsFollowing(!!data)
      } catch (error) {
        console.error('Error checking follow status:', error)
      }
    }
    
    checkIfFollowing()
  }, [userId, profileId])
  
  const handleFollow = async () => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to follow users",
        variant: "destructive"
      })
      return
    }
    
    // 不能關注自己
    if (userId === profileId) {
      toast({
        title: "Cannot follow yourself",
        description: "You cannot follow your own profile",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isFollowing) {
        // 取消關注
        const { error } = await supabaseClient
          .from('user_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', profileId)
        
        if (error) throw error
        
        setIsFollowing(false)
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this user"
        })
      } else {
        // 添加關注
        const { error } = await supabaseClient
          .from('user_follows')
          .insert({
            follower_id: userId,
            following_id: profileId
          })
        
        if (error) throw error
        
        setIsFollowing(true)
        toast({
          title: "Following",
          description: "You are now following this user"
        })
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
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
      onClick={handleFollow}
      disabled={isLoading || userId === profileId} // 不能關注自己
      className={`gap-1 ${isFollowing ? "bg-primary/10 text-primary hover:bg-primary/20" : ""}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-4 w-4" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </Button>
  )
} 