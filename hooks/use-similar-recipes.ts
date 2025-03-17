import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Recipe } from './use-recipe';

export function useSimilarRecipes(recipeId: string, limit = 2) {
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimilarRecipes() {
      if (!recipeId) return;
      
      try {
        setLoading(true);
        const data = await db.getSimilarRecipes(recipeId, limit);
        setSimilarRecipes(data);
      } catch (err: any) {
        console.error('Error fetching similar recipes:', err);
        setError(err.message || '獲取相似食譜時出錯');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSimilarRecipes();
  }, [recipeId, limit]);
  
  return { similarRecipes, loading, error };
} 