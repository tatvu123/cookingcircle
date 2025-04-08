async function addRecipe() {
  try {
    document.querySelectorAll('.recipe-add-modal').forEach(modal => {
      modal.remove();
    });
    
    // Create modal content with form for adding a new recipe
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'recipe-add-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Add New Recipe</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="add-recipe-form" class="p-6">
          <div class="mb-4">
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" id="title" name="title" class="w-full rounded-md border border-gray-300 p-2" required>
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="mb-4">
            <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input type="text" id="tags" name="tags" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="difficulty" class="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select id="difficulty" name="difficulty" class="w-full rounded-md border border-gray-300 p-2">
                <option value="">Select Difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div>
              <label for="cooking_time" class="block text-sm font-medium text-gray-700 mb-1">Cooking Time (mins)</label>
              <input type="number" id="cooking_time" name="cooking_time" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label for="servings" class="block text-sm font-medium text-gray-700 mb-1">Servings</label>
              <input type="number" id="servings" name="servings" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Add Recipe
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
          img.alt = "Recipe Image Preview";
          img.className = "mt-2 w-full h-32 object-cover rounded-md";
          container.appendChild(img);
        }
      } else if (existingImg) {
        existingImg.remove();
      }
    });
    
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
    
    // Handle form submission
    const form = modal.querySelector('#add-recipe-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const newRecipe = {
          title: formData.get('title'),
          image_url: formData.get('image_url'),
          tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          difficulty: formData.get('difficulty'),
          cooking_time: formData.get('cooking_time') ? parseInt(formData.get('cooking_time')) : 0,
          servings: formData.get('servings') ? parseInt(formData.get('servings')) : 0,
          description: formData.get('description'),
          created_at: new Date().toISOString(),
          likes_count: 0,
          views_count: 0
        };
        
        // Insert recipe in Supabase
        const { data, error } = await supabase
          .from('recipes')
          .insert(newRecipe);
        
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
              <p class="text-sm">Recipe added successfully!</p>
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
        console.error('Error adding recipe:', error);
        alert(`Failed to add recipe: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing recipe add form:', error);
  }
}

async function addProduct() {
  try {
    document.querySelectorAll('.product-add-modal').forEach(modal => {
      modal.remove();
    });
    
    // Create modal content with form for adding a new product
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'product-add-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Add New Product</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="add-product-form" class="p-6">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input type="text" id="name" name="name" class="w-full rounded-md border border-gray-300 p-2" required>
          </div>
          
          <div class="mb-4">
            <label for="image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="image_url" name="image_url" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" id="category" name="category" class="w-full rounded-md border border-gray-300 p-2">
            </div>
            
            <div>
              <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input type="number" id="price" name="price" step="0.01" class="w-full rounded-md border border-gray-300 p-2" value="0.00">
            </div>
          </div>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">Rating (0-5)</label>
              <input type="number" id="rating" name="rating" min="0" max="5" step="0.1" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label for="purchases" class="block text-sm font-medium text-gray-700 mb-1">Purchases</label>
              <input type="number" id="purchases" name="purchases" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Stock Status</label>
              <label class="inline-flex items-center">
                <input type="checkbox" name="in_stock" class="rounded border-gray-300" checked>
                <span class="ml-2 text-sm text-gray-700">In Stock</span>
              </label>
            </div>
          </div>
          
          <div class="mb-4">
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="description" name="description" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Add Product
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
          img.alt = "Product Image Preview";
          img.className = "mt-2 w-full h-32 object-cover rounded-md";
          container.appendChild(img);
        }
      } else if (existingImg) {
        existingImg.remove();
      }
    });
    
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
    
    // Handle form submission
    const form = modal.querySelector('#add-product-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const newProduct = {
          name: formData.get('name'),
          image_url: formData.get('image_url'),
          category: formData.get('category'),
          price: formData.get('price') ? parseFloat(formData.get('price')) : 0,
          rating: formData.get('rating') ? parseFloat(formData.get('rating')) : 0,
          purchases: formData.get('purchases') ? parseInt(formData.get('purchases')) : 0,
          in_stock: !!formData.get('in_stock'),
          description: formData.get('description'),
          created_at: new Date().toISOString()
        };
        
        // Insert product in Supabase
        const { data, error } = await supabase
          .from('products')
          .insert(newProduct);
        
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
              <p class="text-sm">Product added successfully!</p>
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
        console.error('Error adding product:', error);
        alert(`Failed to add product: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing product add form:', error);
  }
}

async function addIngredient() {
  try {
    document.querySelectorAll('.ingredient-add-modal').forEach(modal => {
      modal.remove();
    });
    
    // Create modal content with form for adding a new ingredient
    const modal = document.createElement('div');
    modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'ingredient-add-modal');
    
    const modalContent = `
      <div class="bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden">
        <div class="p-4 bg-gray-50 flex justify-between items-center">
          <h3 class="text-lg font-medium">Add New Ingredient</h3>
          <button class="close-modal-btn text-gray-400 hover:text-gray-600">
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="add-ingredient-form" class="p-6">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
            <input type="text" id="name" name="name" class="w-full rounded-md border border-gray-300 p-2" required>
          </div>
          
          <div class="mb-4">
            <label for="ingredient_image_url" class="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input type="text" id="ingredient_image_url" name="ingredient_image_url" class="w-full rounded-md border border-gray-300 p-2">
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="text" id="quantity" name="quantity" class="w-full rounded-md border border-gray-300 p-2">
            </div>
            
            <div>
              <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input type="text" id="unit" name="unit" class="w-full rounded-md border border-gray-300 p-2">
            </div>
          </div>
          
          <div class="mb-4">
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input type="number" id="price" name="price" step="0.01" class="w-full rounded-md border border-gray-300 p-2" value="0.00">
          </div>
          
          <div class="mb-4">
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="notes" name="notes" rows="2" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="mb-4">
            <label for="ingredient_description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea id="ingredient_description" name="ingredient_description" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
          </div>
          
          <div class="flex justify-end gap-2 mt-6">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Add Ingredient
            </button>
          </div>
        </form>
      </div>
    `;
    
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add real-time image preview update when URL changes
    const imageUrlInput = modal.querySelector('#ingredient_image_url');
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
          img.alt = "Ingredient Image Preview";
          img.className = "mt-2 w-full h-32 object-cover rounded-md";
          container.appendChild(img);
        }
      } else if (existingImg) {
        existingImg.remove();
      }
    });
    
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
    
    // Handle form submission
    const form = modal.querySelector('#add-ingredient-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const formData = new FormData(form);
        const newIngredient = {
          name: formData.get('name'),
          ingredient_image_url: formData.get('ingredient_image_url'),
          quantity: formData.get('quantity'),
          unit: formData.get('unit'),
          price: formData.get('price') ? parseFloat(formData.get('price')) : 0,
          notes: formData.get('notes'),
          ingredient_description: formData.get('ingredient_description'),
        };
        
        // Insert ingredient in Supabase
        const { data, error } = await supabase
          .from('ingredients')
          .insert(newIngredient);
        
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
              <p class="text-sm">Ingredient added successfully!</p>
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
        console.error('Error adding ingredient:', error);
        alert(`Failed to add ingredient: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('Error showing ingredient add form:', error);
  }
}

// Connect these functions to the global scope so they can be called from buttons
window.addRecipe = addRecipe;
window.addProduct = addProduct;
window.addIngredient = addIngredient;