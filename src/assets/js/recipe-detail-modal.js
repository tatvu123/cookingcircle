async function showRecipeDetail(recipeId) {
  console.log("Show recipe detail called with ID:", recipeId);
  try {
    document.querySelectorAll('.recipe-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch recipe details
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('recipe_id', recipeId)
      .single();
    
    if (error) throw error;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'recipe-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">${recipe.title}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          ${recipe.image_url ? `<img src="${recipe.image_url}" alt="${recipe.title}" class="w-full h-64 object-cover rounded-md mb-4">` : ''}
          
          <div class="flex flex-wrap gap-2 mb-4">
            ${Array.isArray(recipe.tags) ? recipe.tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">${tag}</span>`).join('') : ''}
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Difficulty</span>
              <span>${recipe.difficulty || 'Not specified'}</span>
            </div>
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Cooking Time</span>
              <span>${recipe.cooking_time || '0'} min</span>
            </div>
            <div class="flex flex-col items-center p-2 border rounded-md">
              <span class="font-medium">Servings</span>
              <span>${recipe.servings || '0'}</span>
            </div>
          </div>
          
          <div class="mb-4">
            <h4 class="text-md font-medium mb-2">Description</h4>
            <p class="text-gray-700">${recipe.description || 'No description provided.'}</p>
          </div>
          
          <div class="flex justify-between text-sm text-gray-500">
            <span>Created: ${new Date(recipe.created_at).toLocaleDateString()}</span>
            <div class="flex space-x-4">
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                ${recipe.likes_count || 0}
              </span>
              <span class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                ${recipe.views_count || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close modal on click
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
  } catch (error) {
    console.error('Error showing recipe details:', error);
  }
}

async function editRecipeDetail(recipeId) {
  console.log("Edit recipe detail called with ID:", recipeId);
  try {
    document.querySelectorAll('.recipe-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch recipe details
    const { data: recipe, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('recipe_id', recipeId)
      .single();
    
    if (error) throw error;
    
    // Create modal content with editable form
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'recipe-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Edit Recipe</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="edit-recipe-form" class="p-6">
          <input type="hidden" name="recipe_id" value="${recipe.recipe_id}">
          
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" id="title" name="title" class="w-full rounded-md border border-gray-300 p-2" value="${recipe.title || ''}">
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2" value="${recipe.image_url || ''}">
            ${recipe.image_url ? `<img src="${recipe.image_url}" alt="${recipe.title}" class="mt-2 w-full h-32 object-cover rounded-md">` : ''}
          </div>
          
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" class="w-full rounded-md border border-gray-300 p-2" value="${Array.isArray(recipe.tags) ? recipe.tags.join(', ') : ''}">
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select id="difficulty" name="difficulty" class="w-full rounded-md border border-gray-300 p-2">
                <option value="">Select Difficulty</option>
                <option value="Easy" ${recipe.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
                <option value="Medium" ${recipe.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Hard" ${recipe.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
              </select>
            </div>
            
            <div>
              <label for="cooking_time" class="block text-sm font-medium text-gray-700 mb-1">Cooking Time (mins)</label>
              <input type="number" id="cooking_time" name="cooking_time" class="w-full rounded-md border border-gray-300 p-2" value="${recipe.cooking_time || '0'}">
            </div>
            
            <div>
              <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" id="servings" name="servings" class="w-full rounded-md border border-gray-300 p-2" value="${recipe.servings || '0'}">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2">${recipe.description || ''}</textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close modal on click
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // Handle form submission
    const form = modal.querySelector('#edit-recipe-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const updatedRecipe = {
          title: formData.get('title'),
          image_url: formData.get('image_url'),
          tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          difficulty: formData.get('difficulty'),
          cooking_time: formData.get('cooking_time') ? parseInt(formData.get('cooking_time')) : 0,
          servings: formData.get('servings') ? parseInt(formData.get('servings')) : 0,
          description: formData.get('description')
        };
        
        // Update recipe in Supabase
        const { error } = await supabase
          .from('recipes')
          .update(updatedRecipe)
          .eq('recipe_id', recipeId);
        
        if (error) throw error;
        
        // Close modal and refresh the table
        document.body.removeChild(modal);
        
        // Refresh the table data
        await loadRecipeData();
        
        // Show success message
        alert('Recipe updated successfully!');
      } catch (error) {
        console.error('Error updating recipe:', error);
        alert(`Failed to update recipe: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing recipe edit form:', error);
  }
}

// Keep the existing showRecipeDetail function for compatibility