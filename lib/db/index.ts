import { createClient } from '@supabase/supabase-js';

// 環境變數
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jipxmhsttfbgovlvuglk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

// 創建 Supabase 客戶端
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// 抽象資料庫接口
export interface Database {
  // 食譜相關方法
  getRecipe: (id: string) => Promise<any>;
  getRecipes: (options?: any) => Promise<any[]>;
  createRecipe: (data: any) => Promise<any>;
  updateRecipe: (id: string, data: any) => Promise<any>;
  deleteRecipe: (id: string) => Promise<void>;
  
  // 食材相關方法
  getIngredients: (recipeId: string) => Promise<any[]>;
  addIngredient: (data: any) => Promise<any>;
  
  // 指令相關方法
  getInstructions: (recipeId: string) => Promise<any[]>;
  
  // 評論相關方法
  getComments: (recipeId: string) => Promise<any[]>;
  addComment: (data: any) => Promise<any>;
  
  // 購物清單相關方法
  addToShoppingList: (userId: string, items: any[]) => Promise<void>;
  getShoppingList: (userId: string) => Promise<any[]>;
  removeFromShoppingList: (userId: string, itemId: string) => Promise<void>;
  
  // 產品相關方法
  getProducts: (limit?: number, category?: string) => Promise<any[]>;
  getProductsByRecipe: (recipeId: string, limit?: number) => Promise<any[]>;
  
  // 獲取相似食譜
  getSimilarRecipes: (recipeId: string, limit?: number) => Promise<any[]>;
}

// Supabase 實現
export class SupabaseDatabase implements Database {
  async getRecipe(id: string) {
    const { data, error } = await supabaseClient
      .from('recipes')
      .select(`
        *,
        users:user_id (username, profile_image)
      `)
      .eq('recipe_id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async getRecipes(options: any = {}) {
    let query = supabaseClient.from('recipes').select('*');
    
    // 處理過濾選項
    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }
    
    // 處理排序
    if (options.orderBy) {
      query = query.order(options.orderBy, { ascending: options.ascending || false });
    }
    
    // 處理分頁
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
  
  async createRecipe(data: any) {
    const { data: result, error } = await supabaseClient
      .from('recipes')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  async updateRecipe(id: string, data: any) {
    const { data: result, error } = await supabaseClient
      .from('recipes')
      .update(data)
      .eq('recipe_id', id)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  async deleteRecipe(id: string) {
    const { error } = await supabaseClient
      .from('recipes')
      .delete()
      .eq('recipe_id', id);
      
    if (error) throw error;
  }
  
  async getIngredients(recipeId: string) {
    const { data, error } = await supabaseClient
      .from('ingredients')
      .select('*')
      .eq('recipe_id', recipeId);
      
    if (error) throw error;
    return data || [];
  }
  
  async addIngredient(data: any) {
    const { data: result, error } = await supabaseClient
      .from('ingredients')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  async getInstructions(recipeId: string) {
    const { data, error } = await supabaseClient
      .from('instructions')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number');
      
    if (error) throw error;
    return data || [];
  }
  
  async getComments(recipeId: string) {
    const { data, error } = await supabaseClient
      .from('comments')
      .select(`
        *,
        user:user_id (username, profile_image)
      `)
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
  
  async addComment(data: any) {
    const { data: result, error } = await supabaseClient
      .from('comments')
      .insert(data)
      .select()
      .single();
      
    if (error) throw error;
    return result;
  }
  
  async addToShoppingList(userId: string, items: any[]) {
    const shoppingItems = items.map(item => ({
      user_id: userId,
      ...item
    }));
    
    const { error } = await supabaseClient
      .from('shopping_list')
      .insert(shoppingItems);
      
    if (error) throw error;
  }
  
  async getShoppingList(userId: string) {
    const { data, error } = await supabaseClient
      .from('shopping_list')
      .select(`
        *,
        ingredients:ingredient_id (*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
  }
  
  async removeFromShoppingList(userId: string, itemId: string) {
    const { error } = await supabaseClient
      .from('shopping_list')
      .delete()
      .eq('user_id', userId)
      .eq('list_id', itemId);
      
    if (error) throw error;
  }
  
  // 產品相關方法
  async getProducts(limit = 3, category?: string) {
    let query = supabaseClient.from('products').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query
      .order('purchases', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  }
  
  async getProductsByRecipe(recipeId: string, limit = 3) {
    // 這裡可以實現通過食譜ID獲取相關產品的邏輯
    // 如果有 recipe_products 關聯表，可以使用 join 查詢
    // 暫時直接返回熱門產品
    return this.getProducts(limit);
  }
  
  // 獲取相似食譜
  async getSimilarRecipes(recipeId: string, limit = 2) {
    // 1. 先獲取當前食譜的標籤
    const { data: currentRecipe, error: recipeError } = await supabaseClient
      .from('recipes')
      .select('tags')
      .eq('recipe_id', recipeId)
      .single();
    
    if (recipeError) throw recipeError;
    
    if (!currentRecipe?.tags || !currentRecipe.tags.length) {
      // 如果當前食譜沒有標籤，返回熱門食譜
      const { data, error } = await supabaseClient
        .from('recipes')
        .select('*')
        .neq('recipe_id', recipeId)  // 排除當前食譜
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      return data || [];
    }
    
    // 2. 根據標籤查找相似食譜
    // PostgreSQL 可以使用 && 運算符來查找陣列交集
    const { data, error } = await supabaseClient
      .from('recipes')
      .select('*')
      .neq('recipe_id', recipeId)  // 排除當前食譜
      .contains('tags', currentRecipe.tags)  // 包含相同標籤的食譜
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    
    // 3. 如果找不到足夠的相似食譜，補充一些最新的食譜
    if (data.length < limit) {
      const { data: additionalRecipes, error: addError } = await supabaseClient
        .from('recipes')
        .select('*')
        .neq('recipe_id', recipeId)  // 排除當前食譜
        .not('recipe_id', 'in', `(${data.map(r => r.recipe_id).join(',')})`)  // 排除已獲取的食譜
        .order('created_at', { ascending: false })
        .limit(limit - data.length);
        
      if (addError) throw addError;
      
      return [...data, ...(additionalRecipes || [])];
    }
    
    return data;
  }
}

// 導出資料庫實例
export const db: Database = new SupabaseDatabase(); 