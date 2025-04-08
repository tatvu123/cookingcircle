const tableConfigurations = {
  recipes: {
    tableName: 'recipes',
    idField: 'recipe_id',
    title: 'Recipes',
    columns: [
      {
        key: 'title',
        header: 'Recipe',
        render: (item) => {
          const tags = Array.isArray(item.tags) ? item.tags.join(', ') : '';
          return `
            <div class="flex items-center">
              ${item.image_url ? `
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-md object-cover" src="${item.image_url}" alt="">
                </div>
              ` : ''}
              <div>
                ${item.title || 'Untitled Recipe'}
                ${tags ? `<p class="text-xs text-gray-500">${tags}</p>` : ''}
              </div>
            </div>
          `;
        }
      },
      { key: 'difficulty', header: 'Difficulty', fallback: 'N/A' },
      {
        key: 'cooking_time',
        header: 'Cooking Time',
        render: (item) => item.cooking_time ? `${item.cooking_time} mins` : 'N/A'
      },
      { key: 'likes_count', header: 'Likes', fallback: 0 },
      { key: 'views_count', header: 'Views', fallback: 0 },
      {
        key: 'created_at',
        header: 'Created',
        render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : ''
      }
    ],
    actions: [
      {
        text: 'Edit',
        class: 'text-primary hover:text-sky-700 mr-3 edit-recipe-btn',
        action: 'edit',
        handler: 'editRecipeDetail'
      },
      {
        text: 'Delete',
        class: 'text-red-500 hover:text-red-700 delete-recipe-btn',
        action: 'delete',
        confirmMessage: 'Are you sure you want to delete this recipe?'
      }
    ],
    orderBy: { column: 'created_at', ascending: false }
  },

  products: {
    tableName: 'products',
    idField: 'product_id',
    title: 'Products',
    columns: [
      {
        key: 'name',
        header: 'Product',
        render: (item) => {
          return `
            <div class="flex items-center">
              ${item.image_url ? `
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-md object-cover" src="${item.image_url}" alt="">
                </div>
              ` : ''}
              <div>
                ${item.name || 'Untitled Product'}
                ${item.category ? `<p class="text-xs text-gray-500">${item.category}</p>` : ''}
              </div>
            </div>
          `;
        }
      },
      {
        key: 'price',
        header: 'Price',
        render: (item) => item.price ? `$${parseFloat(item.price).toFixed(2)}` : '$0.00'
      },
      {
        key: 'rating',
        header: 'Rating',
        render: (item) => item.rating ? `${item.rating.toFixed(1)}/5` : 'N/A'
      },
      {
        key: 'in_stock',
        header: 'Stock',
        render: (item) => item.in_stock ? 
          '<span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">In Stock</span>' : 
          '<span class="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Out of Stock</span>'
      },
      { key: 'purchases', header: 'Purchases', fallback: 0 },
      {
        key: 'created_at',
        header: 'Added',
        render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : ''
      }
    ],
    actions: [
      {
        text: 'Edit',
        class: 'text-primary hover:text-sky-700 mr-3',
        action: 'edit',
        handler: 'editProductDetail'
      },
      {
        text: 'Delete',
        class: 'text-red-500 hover:text-red-700',
        action: 'delete',
        confirmMessage: 'Are you sure you want to delete this product?'
      }
    ],
    orderBy: { column: 'created_at', ascending: false }
  },

  instructions: {
    tableName: 'instructions',
    idField: 'instruction_id',
    title: 'Instructions',
    columns: [
      {
        key: 'recipe_id',
        header: 'Recipe',
        render: async (item) => {
          try {
            const { data, error } = await supabase
              .from('recipes')
              .select('title')
              .eq('recipe_id', item.recipe_id)
              .single();
              
            if (error) throw error;
            return data.title || 'Unknown Recipe';
          } catch (err) {
            console.error('Error fetching recipe:', err);
            return `Recipe ID: ${item.recipe_id}`;
          }
        }
      },
      { key: 'step_number', header: 'Step' },
      { key: 'description', header: 'Description' },
    ],
    actions: [
      {
        text: 'Edit',
        class: 'text-primary hover:text-sky-700 mr-3',
        action: 'edit',
        handler: 'showInstructionDetail'
      },
      {
        text: 'Delete',
        class: 'text-red-500 hover:text-red-700',
        action: 'delete',
        confirmMessage: 'Are you sure you want to delete this instruction?'
      }
    ],
    orderBy: { column: 'recipe_id', ascending: true }
  },

  ingredients: {
    tableName: 'ingredients',
    idField: 'ingredient_id',
    title: 'Ingredients',
    columns: [
      {
        key: 'name',
        header: 'Ingredient Name',
        render: (item) => {
          return `
            <div class="flex items-center">
              ${item.ingredient_image_url ? `
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-md object-cover" src="${item.ingredient_image_url}" alt="${item.name || 'Ingredient'}">
                </div>
              ` : ''}
              <div>
                ${item.name || 'Unnamed Ingredient'}
                ${item.quantity && item.unit ? `<p class="text-xs text-gray-500">${item.quantity} ${item.unit}</p>` : ''}
              </div>
            </div>
          `;
        }
      },
      {
        key: 'recipe_id',
        header: 'Recipe',
        render: async (item) => {
          if (!item.recipe_id) return 'N/A';
          try {
            // Use the foreign key resolver if available
            if (typeof window.foreignKeyResolver !== 'undefined' && typeof window.foreignKeyResolver.resolveRecipe === 'function') {
              return await window.foreignKeyResolver.resolveRecipe(item.recipe_id);
            }
            
            // Fallback direct query
            const { data, error } = await supabase
              .from('recipes')
              .select('title')
              .eq('recipe_id', item.recipe_id)
              .single();
              
            if (error) throw error;
            return data?.title || 'Unknown Recipe';
          } catch (err) {
            console.error('Error fetching recipe:', err);
            return `Recipe ID: ${item.recipe_id.substring(0, 8)}...`;
          }
        }
      },
      {
        key: 'price',
        header: 'Price',
        render: (item) => item.price ? `$${parseFloat(item.price).toFixed(2)}` : '$0.00'
      },
      { 
        key: 'quantity_unit', 
        header: 'Quantity/Unit',
        render: (item) => `${item.quantity || ''} ${item.unit || ''}`.trim() || 'N/A'
      },
      { 
        key: 'notes', 
        header: 'Notes',
        render: (item) => item.notes ? (item.notes.length > 30 ? item.notes.substring(0, 30) + '...' : item.notes) : ''
      }
    ],
    actions: [
      {
        text: 'Edit',
        class: 'text-primary hover:text-sky-700 mr-3',
        action: 'edit',
        handler: 'editIngredientDetail'
      },
      {
        text: 'Delete',
        class: 'text-red-500 hover:text-red-700',
        action: 'delete',
        confirmMessage: 'Are you sure you want to delete this ingredient?'
      }
    ],
    orderBy: { column: 'name', ascending: true }
  }
};