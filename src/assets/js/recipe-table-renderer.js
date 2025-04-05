// Recipe Table Renderer

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Loading recipe data...');
  await loadRecipeData();
  
  // Set up event delegation for actions
  document.addEventListener('click', async function(e) {
    // Handle delete action
    if (e.target && e.target.classList.contains('delete-recipe-btn')) {
      e.preventDefault();
      const recipeId = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this recipe?')) {
        const success = await deleteRecipe(recipeId);
        if (success) {
          await loadRecipeData();
        }
      }
    }
    
    // Handle view action
    if (e.target && e.target.classList.contains('view-recipe-btn')) {
      e.preventDefault();
      const recipeId = e.target.dataset.id;
      await incrementRecipeViews(recipeId);
      // Open a modal or redirect to recipe detail page
      alert('Recipe details would be shown in a modal here');
    }
  });
});

async function loadRecipeData() {
  const recipes = await fetchRecipes();
  console.log('Recipes loaded:', recipes);
  
  // Update all tables with recipe-table-container class
  const tableContainers = document.querySelectorAll('.recipe-table-container');
  
  tableContainers.forEach(container => {
    const tableBody = container.querySelector('tbody');
    const rowClasses = tableBody.dataset.rowClasses || '';
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (!recipes || recipes.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
          No recipes found
        </td>
      `;
      tableBody.appendChild(row);
      return;
    }
    
    // Render each recipe as a table row
    recipes.forEach(recipe => {
      const row = document.createElement('tr');
      
      // Apply row classes if available (for striped tables)
      if (rowClasses) {
        row.className = rowClasses;
      }
      
      // Format date
      const createdDate = recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : '';
      
      // Format tags if available
      const tags = Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '';
      
      // Create table row
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-default-800">
          <div class="flex items-center">
            ${recipe.image_url ? `
              <div class="flex-shrink-0 h-10 w-10 mr-3">
                <img class="h-10 w-10 rounded-md object-cover" src="${recipe.image_url}" alt="">
              </div>
            ` : ''}
            <div>
              ${recipe.title || 'Untitled Recipe'}
              ${tags ? `<p class="text-xs text-gray-500">${tags}</p>` : ''}
            </div>
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
          ${recipe.difficulty || 'N/A'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
          ${recipe.cooking_time ? `${recipe.cooking_time} mins` : 'N/A'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
          ${recipe.likes_count || 0}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
          ${recipe.views_count || 0}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
          ${createdDate}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <a href="#" class="text-primary hover:text-sky-700 mr-3 view-recipe-btn" data-id="${recipe.recipe_id}">View</a>
          <a href="#" class="text-red-500 hover:text-red-700 delete-recipe-btn" data-id="${recipe.recipe_id}">Delete</a>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  });
}