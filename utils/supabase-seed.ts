import { createClient } from '@supabase/supabase-js';
import { 
  recipeData, 
  ingredientsData, 
  instructionsData, 
  commentsData,
  nutritionData
} from '@/data/mock-data';

// 初始化 Supabase 客戶端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jipxmhsttfbgovlvuglk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 將模擬的披薩食譜資料導入 Supabase 資料庫
 */
export async function seedPizzaRecipe() {
  try {
    // 步驟 1: 建立使用者資料 (若需要)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          username: 'Chef Mario',
          email: 'chef.mario@example.com',
          profile_image: '/placeholder.svg',
        }
      ], { onConflict: 'username' })
      .select('user_id');
    
    if (userError) throw userError;
    
    const userId = userData?.[0]?.user_id;
    if (!userId) throw new Error('無法建立或獲取使用者 ID');
    
    // 步驟 2: 插入食譜基本資料
    const { data: recipeInsertData, error: recipeError } = await supabase
      .from('recipes')
      .upsert([
        {
          user_id: userId,
          title: recipeData.title,
          description: recipeData.description,
          image_url: recipeData.image_url,
          cooking_time: recipeData.cooking_time,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty
        }
      ])
      .select('recipe_id');
    
    if (recipeError) throw recipeError;
    
    const recipeId = recipeInsertData?.[0]?.recipe_id;
    if (!recipeId) throw new Error('無法插入食譜資料');
    
    // 步驟 3: 插入食材清單
    const ingredientsToInsert = ingredientsData.map(ingredient => ({
      recipe_id: recipeId,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      notes: ingredient.notes
    }));
    
    const { error: ingredientsError } = await supabase
      .from('ingredients')
      .upsert(ingredientsToInsert);
    
    if (ingredientsError) throw ingredientsError;
    
    // 步驟 4: 插入製作步驟
    const instructionsToInsert = instructionsData.map(instruction => ({
      recipe_id: recipeId,
      step_number: instruction.step_number,
      description: instruction.description
    }));
    
    const { error: instructionsError } = await supabase
      .from('instructions')
      .upsert(instructionsToInsert);
    
    if (instructionsError) throw instructionsError;
    
    // 步驟 5: 插入評論
    // 先為每個評論建立使用者
    for (const comment of commentsData) {
      const { data: commentUserData, error: commentUserError } = await supabase
        .from('users')
        .upsert([
          {
            username: comment.user.username,
            profile_image: comment.user.profile_image
          }
        ], { onConflict: 'username' })
        .select('user_id');
      
      if (commentUserError) throw commentUserError;
      
      const commentUserId = commentUserData?.[0]?.user_id;
      if (!commentUserId) continue;
      
      // 插入評論
      const { error: commentError } = await supabase
        .from('comments')
        .upsert([
          {
            recipe_id: recipeId,
            user_id: commentUserId,
            text: comment.text,
            created_at: comment.created_at
          }
        ]);
      
      if (commentError) throw commentError;
    }
    
    return {
      success: true,
      recipeId,
      message: '披薩食譜資料已成功導入 Supabase'
    };
    
  } catch (error: any) {
    console.error('導入資料時出錯:', error);
    return {
      success: false,
      message: error.message || '導入食譜資料時發生錯誤',
      error
    };
  }
}

/**
 * 在網頁中使用的函數，用來呼叫 seed 函數並處理結果
 */
export async function handleSeedPizzaRecipe() {
  const result = await seedPizzaRecipe();
  
  if (result.success) {
    alert(`成功導入食譜！食譜 ID: ${result.recipeId}`);
    return result.recipeId;
  } else {
    alert(`導入失敗: ${result.message}`);
    console.error(result.error);
    return null;
  }
} 