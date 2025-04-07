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
async function showProductDetail(productId) {
  console.log("Show product detail called with ID:", productId);
  try {
    document.querySelectorAll('.product-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch product details
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .single();
    
    if (error) throw error;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'product-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">${product.name}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="flex items-start gap-6">
            ${product.image_url ? 
              `<div class="w-1/3">
                <img src="${product.image_url}" alt="${product.name}" class="w-full h-48 object-cover rounded-md">
              </div>` : ''}
            <div class="flex-1">
              <h2 class="text-xl font-bold">${product.name}</h2>
              <div class="mt-2 flex items-center gap-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs">${product.category || 'Uncategorized'}</span>
                ${product.in_stock ? 
                  '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">In Stock</span>' : 
                  '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs">Out of Stock</span>'}
              </div>
              <div class="mt-3">
                <div class="text-2xl font-bold text-primary">$${parseFloat(product.price).toFixed(2)}</div>
                <div class="mt-1 flex items-center">
                  ${Array(Math.floor(product.rating || 0)).fill().map(() => 
                    '<svg class="w-4 h-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>'
                  ).join('')}
                  ${product.rating ? `<span class="text-sm text-gray-500 ml-1">(${product.rating.toFixed(1)})</span>` : ''}
                </div>
              </div>
              <div class="mt-4">
                <p class="text-gray-700">${product.description || 'No description available.'}</p>
              </div>
              <div class="mt-4 text-sm text-gray-500">
                <div>Purchases: ${product.purchases || 0}</div>
                <div>Added: ${new Date(product.created_at).toLocaleDateString()}</div>
                ${product.updated_at ? `<div>Last updated: ${new Date(product.updated_at).toLocaleDateString()}</div>` : ''}
              </div>
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
    console.error('Error showing product details:', error);
  }
}

async function editProductDetail(productId) {
  console.log("Edit product detail called with ID:", productId);
  try {
    document.querySelectorAll('.product-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch product details
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('product_id', productId)
      .single();
    
    if (error) throw error;
    
    // Create modal content with editable form
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'product-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Edit Product</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="edit-product-form" class="p-6">
          <input type="hidden" name="product_id" value="${product.product_id}">
          
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" name="name" class="w-full rounded-md border border-gray-300 p-2" value="${product.name || ''}">
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2" value="${product.image_url || ''}">
            ${product.image_url ? `<img src="${product.image_url}" alt="${product.name}" class="mt-2 w-full h-32 object-cover rounded-md">` : ''}
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" id="category" name="category" class="w-full rounded-md border border-gray-300 p-2" value="${product.category || ''}">
            </div>
            
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" id="price" name="price" step="0.01" class="w-full rounded-md border border-gray-300 p-2" value="${product.price || '0.00'}">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
              <input type="number" id="rating" name="rating" min="0" max="5" step="0.1" class="w-full rounded-md border border-gray-300 p-2" value="${product.rating || '0'}">
            </div>
            
            <div>
              <label for="purchases" class="block text-sm font-medium text-gray-700 mb-1">Purchases</label>
              <input type="number" id="purchases" name="purchases" class="w-full rounded-md border border-gray-300 p-2" value="${product.purchases || '0'}">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Stock Status</label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="in_stock" class="rounded border-gray-300" ${product.in_stock ? 'checked' : ''}>
                <span class="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2">${product.description || ''}</textarea>
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
    
    // Add real-time image preview update when URL changes
    const imageUrlInput = modal.querySelector('#image_url');
    imageUrlInput.addEventListener('input', function() {
      const container = this.parentElement;
      const existingImg = container.querySelector('img');
      const url = this.value.trim();
      
      if (url) {
        if (existingImg) {
          existingImg.src = url;
        } else {
          const img = document.createElement('img');
          img.src = url;
          img.alt = "Product Image";
          img.className = "mt-2 w-full h-32 object-cover rounded-md";
          container.appendChild(img);
        }
      } else if (existingImg) {
        existingImg.remove();
      }
    });
    
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
    const form = modal.querySelector('#edit-product-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const updatedProduct = {
          name: formData.get('name'),
          image_url: formData.get('image_url'),
          category: formData.get('category'),
          price: formData.get('price') ? parseFloat(formData.get('price')) : 0,
          rating: formData.get('rating') ? parseFloat(formData.get('rating')) : 0,
          purchases: formData.get('purchases') ? parseInt(formData.get('purchases')) : 0,
          in_stock: !!formData.get('in_stock'),
          description: formData.get('description'),
          updated_at: new Date().toISOString()
        };
        
        // Update product in Supabase
        const { error } = await supabase
          .from('products')
          .update(updatedProduct)
          .eq('product_id', productId);
        
        if (error) throw error;
        
        // Close modal
        document.body.removeChild(modal);
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast';
        notification.innerHTML = `
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Product updated successfully!</p>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Refresh the page after a short delay
        setTimeout(() => {
          notification.remove();
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing product edit form:', error);
  }
}

async function showInstructionDetail(instructionId) {
  console.log("Show instruction detail called with ID:", instructionId);
  try {
    document.querySelectorAll('.instruction-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch the selected instruction
    const { data: instruction, error } = await supabase
      .from('instructions')
      .select('*')
      .eq('instruction_id', instructionId)
      .single();
    
    if (error) throw error;
    
    // Fetch all instructions for this recipe
    const { data: instructions, error: instructionsError } = await supabase
      .from('instructions')
      .select('*')
      .eq('recipe_id', instruction.recipe_id)
      .order('step_number', { ascending: true });
    
    if (instructionsError) throw instructionsError;
    
    // Get recipe name using foreign key resolver
    const recipeTitle = await foreignKeyResolver.resolveRecipe(instruction.recipe_id);
    
    // Create modal content
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'instruction-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Recipe Instructions</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <h2 class="text-xl font-bold">${recipeTitle}</h2>
          </div>
          
          <div class="mt-6">
            <h3 class="text-lg font-medium mb-3">Instructions</h3>
            <div class="space-y-4">
              ${instructions.map(instr => `
                <div class="flex items-start ${instr.instruction_id === instructionId ? 'bg-blue-50 p-3 rounded-md' : ''}">
                  <div class="flex-shrink-0 mr-4">
                    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                      ${instr.step_number}
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-gray-700">${instr.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="edit-instructions-btn py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Edit Instructions
            </button>
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
    
    // Edit instructions button
    const editBtn = modal.querySelector('.edit-instructions-btn');
    editBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      editInstructionSet(instruction.recipe_id);
    });
    
  } catch (error) {
    console.error('Error showing instruction details:', error);
    alert(`Error showing instructions: ${error.message}`);
  }
}

async function editInstructionSet(recipeId) {
  console.log("Edit instruction set called for recipe ID:", recipeId);
  try {
    document.querySelectorAll('.instruction-detail-modal').forEach(modal => {
      modal.remove();
    });
    
    // Fetch all instructions for this recipe
    const { data: instructions, error: instructionsError } = await supabase
      .from('instructions')
      .select('*')
      .eq('recipe_id', recipeId)
      .order('step_number', { ascending: true });
    
    if (instructionsError) throw instructionsError;
    
    // Get recipe name using foreign key resolver
    const recipeTitle = await foreignKeyResolver.resolveRecipe(recipeId);
    
    // Create modal content with editable form
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'instruction-detail-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
        <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
          <h3 class="text-lg font-medium">Edit Instructions for ${recipeTitle}</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
          <form id="edit-instructions-form" class="p-6">
            <input type="hidden" name="recipe_id" value="${recipeId}">
            
            <div id="instructions-container" class="space-y-4 mb-4">
              ${instructions.map((inst, index) => `
                <div class="instruction-item border border-gray-200 p-4 rounded-md" data-id="${inst.instruction_id}">
                  <div class="flex justify-between mb-2">
                    <div class="flex items-center">
                      <span class="mr-2 font-medium">Step</span>
                      <input type="number" name="step_number_${inst.instruction_id}" class="w-16 rounded-md border border-gray-300 p-1" value="${inst.step_number}" min="1">
                    </div>
                    <button type="button" class="delete-step-btn text-red-500 hover:text-red-700" data-id="${inst.instruction_id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <textarea name="description_${inst.instruction_id}" rows="3" class="w-full rounded-md border border-gray-300 p-2">${inst.description || ''}</textarea>
                </div>
              `).join('')}
            </div>
            
            <button type="button" id="add-step-btn" class="flex items-center text-primary hover:text-primary-700 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Step
            </button>
          </form>
        </div>
        
        <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
          <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" id="save-changes-btn" form="edit-instructions-form" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
            Save Changes
          </button>
        </div>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Close modal handlers
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
    
    // Add new step button
    const addStepBtn = modal.querySelector('#add-step-btn');
    const instructionsContainer = modal.querySelector('#instructions-container');
    let newStepCounter = 0;
    
    addStepBtn.addEventListener('click', () => {
      const nextStepNumber = instructions.length > 0 ? 
        Math.max(...instructions.map(i => i.step_number)) + 1 : 1;
      const newStepId = `new-${newStepCounter++}`;
      
      const newStepHTML = `
        <div class="instruction-item border border-gray-200 p-4 rounded-md bg-green-50" data-id="${newStepId}">
          <div class="flex justify-between mb-2">
            <div class="flex items-center">
              <span class="mr-2 font-medium">Step</span>
              <input type="number" name="step_number_${newStepId}" class="w-16 rounded-md border border-gray-300 p-1" value="${nextStepNumber}" min="1">
            </div>
            <button type="button" class="delete-step-btn text-red-500 hover:text-red-700" data-id="${newStepId}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <textarea name="description_${newStepId}" rows="3" class="w-full rounded-md border border-gray-300 p-2" placeholder="Enter step description..."></textarea>
        </div>
      `;
      
      instructionsContainer.insertAdjacentHTML('beforeend', newStepHTML);
      
      // Add delete event listener for the new step
      const newDeleteBtn = instructionsContainer.querySelector(`[data-id="${newStepId}"] .delete-step-btn`);
      newDeleteBtn.addEventListener('click', function() {
        const item = instructionsContainer.querySelector(`[data-id="${newStepId}"]`);
        item.remove();
      });
    });
    
    // Delete step button handlers
    const deleteStepBtns = modal.querySelectorAll('.delete-step-btn');
    deleteStepBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const stepId = this.getAttribute('data-id');
        const item = instructionsContainer.querySelector(`[data-id="${stepId}"]`);
        item.remove();
      });
    });
    
    // Handle form submission
    const form = modal.querySelector('#edit-instructions-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const recipeId = formData.get('recipe_id');
        
        // Get all instruction items
        const instructionItems = modal.querySelectorAll('.instruction-item');
        
        // Prepare arrays for updates, inserts and deletes
        const toUpdate = [];
        const toInsert = [];
        const existingIds = new Set();
        
        // Process each instruction item
        instructionItems.forEach(item => {
          const itemId = item.getAttribute('data-id');
          const stepNumber = parseInt(formData.get(`step_number_${itemId}`), 10);
          const description = formData.get(`description_${itemId}`);
          
          if (itemId.startsWith('new-')) {
            // This is a new instruction
            toInsert.push({
              recipe_id: recipeId,
              step_number: stepNumber,
              description: description
            });
          } else {
            // This is an existing instruction
            existingIds.add(itemId);
            toUpdate.push({
              instruction_id: itemId,
              recipe_id: recipeId,
              step_number: stepNumber,
              description: description
            });
          }
        });
        
        // Find instructions to delete (those in original list but not in the form)
        const toDelete = instructions
          .filter(inst => !existingIds.has(inst.instruction_id))
          .map(inst => inst.instruction_id);
        
        // Execute database operations
        const promises = [];
        
        if (toUpdate.length > 0) {
          promises.push(supabase.from('instructions').upsert(toUpdate));
        }
        
        if (toInsert.length > 0) {
          promises.push(supabase.from('instructions').insert(toInsert));
        }
        
        if (toDelete.length > 0) {
          promises.push(supabase.from('instructions').delete().in('instruction_id', toDelete));
        }
        
        const results = await Promise.all(promises);
        
        // Check for errors
        for (const result of results) {
          if (result.error) throw result.error;
        }
        
        // Close modal
        document.body.removeChild(modal);
        
        // Show success message
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast';
        notification.innerHTML = `
          <div class="flex items-center">
            <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
            <div>
              <p class="text-sm">Recipe instructions updated successfully!</p>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Refresh the page after a short delay
        setTimeout(() => {
          notification.remove();
          window.location.reload();
        }, 1500);
        
      } catch (error) {
        console.error('Error updating instructions:', error);
        alert(`Failed to update instructions: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing instruction edit form:', error);
    alert(`Error showing instruction editor: ${error.message}`);
  }
}
