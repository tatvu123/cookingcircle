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
        text: 'View', 
        class: 'text-primary hover:text-sky-700 mr-3 view-recipe-btn',
        action: 'view',
        handler: 'showRecipeDetail'
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
  
  users: {
    tableName: 'users',
    idField: 'user_id',
    title: 'Users',
    columns: [
      {
        key: 'avatar_url',
        header: 'User',
        render: (item) => {
          return `
            <div class="flex items-center">
              ${item.avatar_url ? `
                <div class="flex-shrink-0 h-10 w-10 mr-3">
                  <img class="h-10 w-10 rounded-full object-cover" src="${item.avatar_url}" alt="">
                </div>
              ` : ''}
              <div>
                ${item.full_name || item.email || 'Unknown User'}
                ${item.email ? `<p class="text-xs text-gray-500">${item.email}</p>` : ''}
              </div>
            </div>
          `;
        }
      },
      { key: 'role', header: 'Role', fallback: 'User' },
      { key: 'last_login', header: 'Last Login', render: (item) => item.last_login ? new Date(item.last_login).toLocaleString() : 'Never' }
    ],
    actions: [
      { text: 'View', class: 'text-primary hover:text-sky-700 mr-3', action: 'view', handler: 'showUserDetail' },
      { text: 'Delete', class: 'text-red-500 hover:text-red-700', action: 'delete', confirmMessage: 'Are you sure you want to delete this user?' }
    ],
    orderBy: { column: 'created_at', ascending: false }
  }
  
};