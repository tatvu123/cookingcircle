import { useState, useEffect } from 'react';
import { db } from '@/lib/db';

export interface Product {
  product_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category?: string;
  rating?: number;
  purchases?: number;
  in_stock?: boolean;
  created_at?: string;
}

export function useProducts(limit = 3, category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const data = await db.getProducts(limit, category);
        setProducts(data);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || '獲取產品資料時出錯');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [limit, category]);
  
  return { products, loading, error };
}

export function useProductsByRecipe(recipeId: string, limit = 3) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (!recipeId) return;
      
      try {
        setLoading(true);
        const data = await db.getProductsByRecipe(recipeId, limit);
        setProducts(data);
      } catch (err: any) {
        console.error('Error fetching products for recipe:', err);
        setError(err.message || '獲取食譜相關產品時出錯');
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, [recipeId, limit]);
  
  return { products, loading, error };
} 