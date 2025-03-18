import { createClient } from "@supabase/supabase-js";

// 從 db 索引檔案導入 supabase 客戶端
import { supabase } from "./db";

export interface NutritionFacts {
  id?: string;
  recipe_id: string;
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  serving_size?: string;
  servings_per_recipe?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * 獲取指定食譜的營養成分資訊
 */
export async function getNutritionByRecipeId(
  recipeId: string
): Promise<NutritionFacts | null> {
  try {
    const { data, error } = await supabase
      .from("recipe_nutrition")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    if (error) {
      console.error("Error fetching nutrition facts:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Exception fetching nutrition facts:", error);
    return null;
  }
}

/**
 * 保存食譜的營養成分資訊
 */
export async function saveNutritionFacts(
  nutrition: NutritionFacts
): Promise<boolean> {
  try {
    // 檢查是否已存在該食譜的營養資訊
    const { data: existingData } = await supabase
      .from("recipe_nutrition")
      .select("id")
      .eq("recipe_id", nutrition.recipe_id)
      .single();

    let result;

    if (existingData) {
      // 更新現有記錄
      result = await supabase
        .from("recipe_nutrition")
        .update({
          calories: nutrition.calories,
          protein: nutrition.protein,
          carbohydrates: nutrition.carbohydrates,
          fat: nutrition.fat,
          fiber: nutrition.fiber,
          sugar: nutrition.sugar,
          sodium: nutrition.sodium,
          cholesterol: nutrition.cholesterol,
          serving_size: nutrition.serving_size,
          servings_per_recipe: nutrition.servings_per_recipe,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id);
    } else {
      // 創建新記錄
      result = await supabase.from("recipe_nutrition").insert({
        recipe_id: nutrition.recipe_id,
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbohydrates: nutrition.carbohydrates,
        fat: nutrition.fat,
        fiber: nutrition.fiber,
        sugar: nutrition.sugar,
        sodium: nutrition.sodium,
        cholesterol: nutrition.cholesterol,
        serving_size: nutrition.serving_size,
        servings_per_recipe: nutrition.servings_per_recipe,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (result.error) {
      console.error("Error saving nutrition facts:", result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception saving nutrition facts:", error);
    return false;
  }
}

/**
 * 刪除食譜的營養成分資訊
 */
export async function deleteNutritionFacts(recipeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("recipe_nutrition")
      .delete()
      .eq("recipe_id", recipeId);

    if (error) {
      console.error("Error deleting nutrition facts:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting nutrition facts:", error);
    return false;
  }
}

/**
 * 格式化營養素值的顯示，附帶單位
 * @param value 值
 * @param unit 單位
 * @returns 格式化的字符串
 */
export function formatNutritionValue(
  value?: number,
  unit: string = "g"
): string {
  if (value === undefined || value === null) return "-";
  return `${value} ${unit}`;
}
