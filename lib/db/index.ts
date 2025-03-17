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
}

// 導出資料庫實例
export const db: Database = new SupabaseDatabase(); 