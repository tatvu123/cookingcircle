import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

// 定義類型
export interface Recipe {
  recipe_id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  cooking_time: number;
  servings: number;
  difficulty: string;
  created_at: string;
  tags?: string[];
  users?: {
    username: string;
    profile_image?: string;
  };
  likes_count?: number;
  views_count?: number;
}

export interface Ingredient {
  ingredient_id: string;
  recipe_id: string;
  name: string;
  quantity: string;
  unit: string;
  notes?: string;
}

export interface Instruction {
  instruction_id: string;
  recipe_id: string;
  step_number: number;
  description: string;
}

export interface Comment {
  comment_id: string;
  user_id: string;
  recipe_id: string;
  text: string;
  created_at: string;
  user?: {
    username: string;
    profile_image?: string;
  };
}

export function useRecipe(recipeId: string) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipeData() {
      if (!recipeId) return;
      
      try {
        setLoading(true);
        
        // 使用抽象資料庫層獲取資料
        const [recipeData, ingredientsData, instructionsData, commentsData] = await Promise.all([
          db.getRecipe(recipeId),
          db.getIngredients(recipeId),
          db.getInstructions(recipeId),
          db.getComments(recipeId)
        ]);
        
        setRecipe(recipeData);
        setIngredients(ingredientsData);
        setInstructions(instructionsData);
        setComments(commentsData);
        
      } catch (err: any) {
        console.error('Error fetching recipe data:', err);
        setError(err.message || '獲取食譜數據時出錯');
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecipeData();
  }, [recipeId]);
  
  return { 
    recipe, 
    ingredients, 
    instructions, 
    comments, 
    loading, 
    error 
  };
} 