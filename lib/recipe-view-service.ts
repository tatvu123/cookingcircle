import { supabaseClient } from "@/lib/db"

/**
 * Records a view for a recipe
 * @param recipeId The ID of the recipe being viewed
 * @param userId Optional user ID of the viewer
 * @returns 
 */
export async function recordRecipeView(recipeId: string, userId?: string) {
  try {
    // Create a hashed IP to avoid storing raw IPs (for privacy)
    // In a production app, use a more secure hashing method
    const ipAddress = 'anonymous'
    
    const { error } = await supabaseClient
      .from('recipe_views')
      .insert({
        recipe_id: recipeId,
        user_id: userId || null,
        ip_address: ipAddress
      })
    
    if (error) {
      console.error('Error recording view:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error recording view:', error)
    return false
  }
}

/**
 * Gets the view count for a recipe
 * @param recipeId The ID of the recipe
 * @returns The number of views
 */
export async function getRecipeViewCount(recipeId: string): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from('recipes')
      .select('views_count')
      .eq('recipe_id', recipeId)
      .single()
    
    if (error) {
      console.error('Error fetching view count:', error)
      return 0
    }
    
    return data?.views_count || 0
  } catch (error) {
    console.error('Error fetching view count:', error)
    return 0
  }
}

/**
 * Formats a view count for display (e.g. 1200 -> 1.2k)
 * @param count The raw view count
 * @returns Formatted view count string
 */
export function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}m`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  } else {
    return count.toString()
  }
} 