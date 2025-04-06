document.addEventListener('DOMContentLoaded', async function() {
  console.log('Loading recipe data...');
  await loadRecipeData();
  
  document.addEventListener('click', async function(e) {
    // If the event has already been handled by another handler, ignore it
    if (e.recipeActionHandled) return;
    
    // delete
    if (e.target && e.target.classList.contains('delete-recipe-btn')) {
      e.preventDefault();
      // Mark the event as handled to prevent duplicate processing
      e.recipeActionHandled = true;
      
      const recipeId = e.target.dataset.id;
      if (confirm('Are you sure you want to delete this recipe?')) {
        const success = await deleteRecipe(recipeId);
        if (success) {
          // Refresh only the specific table where the delete happened
          const container = e.target.closest('[data-table-type="recipes"], .recipe-table-container');
          if (container) {
            if (container.getAttribute('data-table-type') === 'recipes' && window.tableRenderer) {
              const config = window.tableRenderer.tableConfigs['recipes'];
              await window.tableRenderer.renderTable(container, config);
            } else {
              await loadRecipeData();
            }
          } else {
            // Fall back to refreshing all tables
            await loadRecipeData();
          }
        }
      }
    }
    
    // edit
    if (e.target && e.target.classList.contains('edit-recipe-btn')) {
      e.preventDefault();
      // Mark the event as handled to prevent duplicate processing
      e.recipeActionHandled = true;
      
      const recipeId = e.target.dataset.id;
      await editRecipeDetail(recipeId);
    }
  });
});

async function loadRecipeData() {
  const recipes = await fetchRecipes();
  console.log('Recipes loaded:', recipes);
  
  // Update traditional tables with recipe-table-container class
  const traditionalTableContainers = document.querySelectorAll('.recipe-table-container');
  traditionalTableContainers.forEach(container => {
    renderTableContent(container, recipes);
  });
  
  // Update dynamic tables with data-table-type="recipes"
  const dynamicTableContainers = document.querySelectorAll('[data-table-type="recipes"]');
  dynamicTableContainers.forEach(container => {
    // If the dynamic table renderer exists, use it to refresh
    if (window.tableRenderer) {
      const config = window.tableRenderer.tableConfigs['recipes'];
      if (config) {
        window.tableRenderer.renderTable(container, config);
      }
    }
    // Otherwise fall back to our basic renderer
    else {
      renderTableContent(container, recipes);
    }
  });
}

// Helper function to render table content in a container
function renderTableContent(container, recipes) {
  const tableBody = container.querySelector('tbody');
  if (!tableBody) return;
  
  const rowClasses = tableBody.dataset.rowClasses || '';
  
  // Clear table body
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
  
  // Rest of your existing table rendering code...
  recipes.forEach(recipe => {
    // Existing code to create and append rows
    const row = document.createElement('tr');
    
    if (rowClasses) {
      row.className = rowClasses;
    }
    
    // Format date
    const createdDate = recipe.created_at ? new Date(recipe.created_at).toLocaleDateString() : '';
    
    // Format tags if available
    const tags = Array.isArray(recipe.tags) ? recipe.tags.join(', ') : '';
    
    // Create table row with the existing template
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
        <a href="#" class="text-primary hover:text-sky-700 mr-3 edit-recipe-btn" data-id="${recipe.recipe_id}">Edit</a>
        <a href="#" class="text-red-500 hover:text-red-700 delete-recipe-btn" data-id="${recipe.recipe_id}">Delete</a>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

