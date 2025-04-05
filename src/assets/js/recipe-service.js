async function fetchRecipes() {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

async function deleteRecipe(recipeId) {
  try {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('recipe_id', recipeId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return false;
  }
}

async function incrementRecipeViews(recipeId) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('views_count')
      .eq('recipe_id', recipeId)
      .single();
    
    if (error) throw error;
    
    const currentViews = data.views_count || 0;
    
    const { error: updateError } = await supabase
      .from('recipes')
      .update({ views_count: currentViews + 1 })
      .eq('recipe_id', recipeId);
    
    if (updateError) throw updateError;
    return true;
  } catch (error) {
    console.error('Error updating recipe views:', error);
    return false;
  }
}