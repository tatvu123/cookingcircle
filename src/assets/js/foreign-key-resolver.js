class ForeignKeyResolver {
  constructor() {
    this.cache = {};
    this.resolvers = {
      // Define resolvers for different entity types
      'recipe_id': this.resolveRecipe.bind(this)
    };
  }
  
  /**
   * Main resolution method - determines the appropriate resolver
   */
  async resolve(columnName, value) {
    if (!value) return 'N/A';
    
    // Try exact column name match
    if (this.resolvers[columnName]) {
      return this.resolvers[columnName](value);
    }
    
    // Try to find a matching resolver based on column name pattern
    for (const key of Object.keys(this.resolvers)) {
      if (columnName.endsWith(key)) {
        return this.resolvers[key](value);
      }
    }
    
    // Return the raw value if no resolver found
    return value;
  }
  
  /**
   * Resolve recipe IDs to recipe titles
   */
  async resolveRecipe(recipeId) {
    // Check cache first
    if (this.cache['recipe_' + recipeId]) {
      return this.cache['recipe_' + recipeId];
    }
    
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('title')
        .eq('recipe_id', recipeId)
        .single();
      
      if (error) throw error;
      
      const title = data?.title || 'Unknown Recipe';
      
      // Create HTML that shows the title but includes the ID as a tooltip
      const html = `
        <span title="ID: ${recipeId}" class="cursor-help border-b border-dotted border-gray-400">
          ${title}
        </span>
      `;
      
      // Cache the result
      this.cache['recipe_' + recipeId] = html;
      
      return html;
    } catch (error) {
      console.error(`Error resolving recipe ID ${recipeId}:`, error);
      return `Recipe #${recipeId.substring(0, 8)}...`;
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache() {
    this.cache = {};
  }
}

const foreignKeyResolver = new ForeignKeyResolver();