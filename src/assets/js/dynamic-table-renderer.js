class DynamicTableRenderer {
  constructor() {
    this.tableConfigs = tableConfigurations || {};
    this.initializeTables();
    this.setupEventListeners();
  }
  
  initializeTables() {
    document.addEventListener('DOMContentLoaded', async () => {
      const tableContainers = document.querySelectorAll('[data-table-type]');
      
      for (const container of tableContainers) {
        const tableType = container.dataset.tableType;
        
        // Try to get configuration
        let config = this.tableConfigs[tableType];
        
        if (!config) {
          // Auto-generate config if not found
          config = await configGenerator.generateConfig(tableType);
          
          if (config) {
            // Store for future use
            this.tableConfigs[tableType] = config;
          } else {
            console.error(`Could not generate configuration for table type: ${tableType}`);
            continue;
          }
        }
        
        await this.renderTable(container, config);
      }
    });
  }
  

  setupEventListeners() {
    if (this.eventListenersAttached) return;
    this.eventListenersAttached = true;
    
    // Existing click handler for edit/delete
    document.addEventListener('click', async (e) => {
      // If the event has already been handled, skip processing
      if (e.recipeActionHandled) return;
      
      // Support both the generic table-action-btn class and specific action classes
      const isActionButton = e.target.classList.contains('table-action-btn') || 
                            e.target.classList.contains('edit-recipe-btn') ||
                            e.target.classList.contains('delete-recipe-btn');
      
      if (!e.target || !isActionButton) return;
      
      // Mark this event as handled to prevent duplicate processing
      e.recipeActionHandled = true;
      e.preventDefault();
      
      let action, tableType, itemId;
      
      if (e.target.classList.contains('edit-recipe-btn')) {
        action = 'edit';
        itemId = e.target.dataset.id;
        tableType = 'recipes';
      } else if (e.target.classList.contains('delete-recipe-btn')) {
        action = 'delete';
        itemId = e.target.dataset.id;
        tableType = 'recipes';
      } else {
        // Get data from the generic table-action-btn
        action = e.target.dataset.action;
        tableType = e.target.dataset.tableType;
        itemId = e.target.dataset.id;
      }
      
      const config = this.tableConfigs[tableType];
      
      if (!config) return;
      
      switch (action) {
        case 'delete':
          const actionConfig = config.actions.find(a => a.action === 'delete');
          if (actionConfig && confirm(actionConfig.confirmMessage || 'Are you sure?')) {
            try {
              // Show deletion in progress
              const row = e.target.closest('tr');
              if (row) {
                row.style.opacity = '0.5';
                row.style.transition = 'opacity 0.2s';
              }
              
              // Delete the item from database
              const success = await this.deleteItem(config.tableName, config.idField, itemId);
              
              if (success) {
                // Show brief success message
                const notification = document.createElement('div');
                notification.className = 'fixed inset-x-0 top-4 flex justify-center z-50';
                notification.innerHTML = `
                  <div class="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded shadow-md">
                    <div class="flex items-center">
                      <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
                      <div>
                        <p class="text-sm">Item deleted successfully. Refreshing page...</p>
                      </div>
                    </div>
                  </div>
                `;
                document.body.appendChild(notification);
              
                setTimeout(() => {
                  // Force reload the entire page
                  window.location.reload();
                }, 800);
              } else {
                // Restore the row if deletion failed
                if (row) {
                  row.style.opacity = '1';
                }
                alert('Failed to delete the item. Please try again.');
              }
            } catch (err) {
              console.error('Error during deletion:', err);
              alert('An error occurred while deleting the item.');
            }
          }
          break;
          
        case 'edit':
          try {
            // First, try specific table editor (like recipes already has)
            const editorFunction = `edit${tableType.charAt(0).toUpperCase() + tableType.slice(1).replace(/s$/, '')}Detail`;
            
            if (typeof window[editorFunction] === 'function') {
              // Use table-specific handler if available (like editRecipeDetail)
              await window[editorFunction](itemId);
            } else {
              // Use generic editor for other tables
              await this.showGenericEditModal(config.tableName, config.idField, itemId, config.columns);
            }
          } catch (error) {
            console.error(`Error editing ${tableType}:`, error);
            alert(`Could not edit ${tableType}. Error: ${error.message}`);
          }
          break;
      }
    }, true); // Using capture phase to ensure this runs before other handlers
    
    // New event listener for add buttons
    document.addEventListener('click', async (e) => {
      if (!e.target.closest('.add-item-btn')) return;
      
      const addButton = e.target.closest('.add-item-btn');
      const tableType = addButton.dataset.tableType;
      
      if (!tableType) return;
      
      // Use custom add modals for recipes, products and ingredients
      if (tableType === 'recipes' && typeof window.addRecipe === 'function') {
        window.addRecipe();
        return;
      }
      
      if (tableType === 'products' && typeof window.addProduct === 'function') {
        window.addProduct();
        return;
      }
      
      if (tableType === 'ingredients' && typeof window.addIngredient === 'function') {
        window.addIngredient();
        return;
      }
      
      // Fall back to generic add modal for other tables
      const config = this.tableConfigs[tableType];
      if (!config) return;
      
      try {
        await this.showGenericAddModal(config.tableName, config.idField, config.columns);
      } catch (error) {
        console.error(`Error adding to ${tableType}:`, error);
        alert(`Could not open add form: ${error.message}`);
      }
    });
  }
  
  async fetchItems(tableName, orderBy = null) {
    try {
      let query = supabase.from(tableName).select('*');
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
  }
  
  async fetchItemById(tableName, idField, id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq(idField, id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching item from ${tableName}:`, error);
      return null;
    }
  }
  
  async deleteItem(tableName, idField, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq(idField, id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      return false;
    }
  }
  
  async insertItem(tableName, item) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert(item);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error inserting item into ${tableName}:`, error);
      return false;
    }
  }

  async renderTable(container, config) {
    // Remove overflow class first to avoid stacking
    container.classList.remove('overflow-auto');
    container.classList.add('overflow-auto');
    
    // Find the card header to add our button
    const cardHeader = container.closest('.card')?.querySelector('.card-header');
    if (cardHeader) {
      // Check if we already added a button
      if (!cardHeader.querySelector('.add-item-btn')) {
        const addButton = document.createElement('button');
        addButton.className = 'add-item-btn py-1 px-3 inline-flex items-center gap-1 text-sm font-medium bg-primary text-white rounded-md ml-auto';
        addButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New
        `;
        addButton.dataset.tableType = config.tableName;
        
        // Make the header flex to position the button on the right
        cardHeader.style.display = 'flex';
        cardHeader.style.justifyContent = 'space-between';
        cardHeader.style.alignItems = 'center';
        
        cardHeader.appendChild(addButton);
      }
    }
    
    // IMPORTANT: Completely remove all child elements first
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    
    // Now rebuild the table structure completely
    container.innerHTML = `
      <div class="table-wrapper">
        <div class="table-responsive custom-scroll">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
              <tr>
                ${config.columns.map(col => 
                  `<th scope="col" class="px-6 py-3 text-start text-sm text-default-500 min-w-[120px]">${col.header}</th>`
                ).join('')}
                ${config.actions && config.actions.length ? '<th scope="col" class="px-6 py-3 text-end text-sm text-default-500 min-w-[100px]">Actions</th>' : ''}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200" ${container.dataset.rowClasses ? `data-row-classes="${container.dataset.rowClasses}"` : ''}>
              <tr>
                <td colspan="${config.columns.length + (config.actions && config.actions.length ? 1 : 0)}" class="px-6 py-4 text-center text-sm text-gray-500">
                  Loading data...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    const table = container.querySelector('table');
    const tableWrapper = container.querySelector('.table-wrapper');
    const tableResponsive = container.querySelector('.table-responsive');
    const tableBody = table.querySelector('tbody');
    const rowClasses = tableBody.dataset.rowClasses || '';
    
    // Fetch data
    const items = await this.fetchItems(config.tableName, config.orderBy);
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (!items || items.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="${config.columns.length + (config.actions && config.actions.length ? 1 : 0)}" class="px-6 py-4 text-center text-sm text-gray-500">
          No data found
        </td>
      `;
      tableBody.appendChild(row);
      return;
    }

    // Scrolling configuration should come before any async operations
    if (items.length > 5) {
      tableResponsive.style.maxHeight = '400px';
      tableResponsive.style.overflowY = 'auto';
    } else {
      tableResponsive.style.maxHeight = 'none';
      tableResponsive.style.overflowY = 'visible';
    }
    
    // Always enable horizontal scrolling
    tableResponsive.style.overflowX = 'auto';
    
    // Array to store all rendering promises
    const renderPromises = [];
    
    // Pre-render cells with foreign keys to avoid multiple DB queries
    for (const item of items) {
      for (const column of config.columns) {
        if (column.render && column.render.constructor.name === 'AsyncFunction') {
          // Store the result in a temporary property on the item
          renderPromises.push((async () => {
            item[`_rendered_${column.key}`] = await column.render(item);
          })());
        }
      }
    }
    
    // Wait for all async renders to complete
    if (renderPromises.length > 0) {
      await Promise.all(renderPromises);
    }
    
    // Render each item as a table row
    items.forEach(item => {
      const row = document.createElement('tr');
      
      // Apply row classes if available
      if (rowClasses) {
        row.className = rowClasses;
      }
      
      // Create cells for each column
      let innerHTML = '';
      
      // Add data cells
      config.columns.forEach(column => {
        const value = item[column.key];
        let cellContent;
        
        // If we have a pre-rendered value from an async renderer, use it
        if (item[`_rendered_${column.key}`] !== undefined) {
          cellContent = item[`_rendered_${column.key}`];
        } else if (column.render && column.render.constructor.name !== 'AsyncFunction') {
          // Use custom renderer (synchronous)
          cellContent = column.render(item);
        } else if (value !== undefined && value !== null) {
          // Use raw value
          cellContent = value;
        } else {
          // Use fallback
          cellContent = column.fallback !== undefined ? column.fallback : '';
        }
        
        innerHTML += `
          <td class="px-6 py-4 whitespace-nowrap text-sm text-default-800">
            ${cellContent}
          </td>
        `;
      });
      
      // Add action cell if there are actions
      if (config.actions && config.actions.length) {
        innerHTML += `
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            ${config.actions.map(action => `
              <a href="#" class="table-action-btn ${action.class}" 
                data-action="${action.action}" 
                data-table-type="${config.tableName}" 
                data-id="${item[config.idField]}">${action.text}</a>
            `).join('')}
          </td>
        `;
      }
      
      row.innerHTML = innerHTML;
      tableBody.appendChild(row);
    });
  }

  async showGenericEditModal(tableName, idField, itemId, columns) {
    try {
      // Remove any existing modals
      document.querySelectorAll('.generic-edit-modal').forEach(modal => {
        modal.remove();
      });
      
      // Fetch item details
      const item = await this.fetchItemById(tableName, idField, itemId);
      if (!item) throw new Error(`Could not find ${tableName} with ${idField}=${itemId}`);
      
      // Create modal container
      const modal = document.createElement('div');
      modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'generic-edit-modal');
      
      // Build form fields based on columns configuration
      let formFields = '';
      
      columns.forEach(column => {
        // Skip primary key field from being editable
        if (column.key === idField) return;
        
        const value = item[column.key] !== undefined && item[column.key] !== null ? item[column.key] : '';
        
        // Handle different column types appropriately
        if (typeof value === 'boolean') {
          // Checkbox for boolean values
          formFields += `
            <div class="mb-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="${column.key}" class="rounded border-gray-300" ${value ? 'checked' : ''}>
                <span class="ml-2 text-sm font-medium text-gray-700">${column.header}</span>
              </label>
            </div>
          `;
        } else if (typeof value === 'number') {
          // Number input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <input type="number" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2" value="${value}">
            </div>
          `;
        } else if (Array.isArray(value)) {
          // Handle arrays (like tags) with comma-separated input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header} (comma separated)</label>
              <input type="text" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2" value="${value.join(', ')}">
            </div>
          `;
        } else if (typeof value === 'string' && value.length > 100) {
          // Textarea for long text
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <textarea id="${column.key}" name="${column.key}" rows="4" class="w-full rounded-md border border-gray-300 p-2">${value}</textarea>
            </div>
          `;
        } else {
          // Default to text input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <input type="text" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2" value="${value !== null ? value : ''}">
            </div>
          `;
        }
      });
      
      // Create modal content with scrolling support
      const modalContent = `
        <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
          <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
            <h3 class="text-lg font-medium">Edit ${tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/s$/, '')}</h3>
            <button class="close-modal-btn text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
            <form id="edit-form" class="p-6">
              <input type="hidden" name="${idField}" value="${item[idField]}">
            
              ${formFields}
            </form>
          </div>
          <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" id="save-changes-btn" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save Changes
            </button>
          </div>
        </div>
      `;
      
      modal.innerHTML = modalContent;
      document.body.appendChild(modal);
      
      // Add event listeners for closing modal
      const closeBtn = modal.querySelector('.close-modal-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');
      const form = modal.querySelector('#edit-form');
      const saveBtn = modal.querySelector('#save-changes-btn');
      
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
      
      // Connect save button to form submission
      saveBtn.addEventListener('click', () => {
        form.dispatchEvent(new Event('submit'));
      });
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
          const formData = new FormData(form);
          const updatedItem = {};
          
          // Process form data
          columns.forEach(column => {
            if (column.key === idField) return; // Skip ID field
            
            let value = formData.get(column.key);
            
            // Handle different data types
            if (typeof item[column.key] === 'boolean') {
              value = !!formData.get(column.key); // Convert to boolean
            } else if (typeof item[column.key] === 'number') {
              value = value ? Number(value) : 0;
            } else if (Array.isArray(item[column.key])) {
              value = value ? value.split(',').map(item => item.trim()).filter(item => item) : [];
            }
            
            updatedItem[column.key] = value;
          });
          
          // Update item in database
          const { error } = await supabase
            .from(tableName)
            .update(updatedItem)
            .eq(idField, itemId);
          
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
                <p class="text-sm">Item updated successfully!</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
            // Refresh page to update data
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Error updating item:', error);
          alert(`Failed to update item: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error showing edit modal:', error);
      alert(`Could not display edit form: ${error.message}`);
    }
  }

  async showGenericAddModal(tableName, idField, columns) {
    try {
      // Remove any existing modals
      document.querySelectorAll('.generic-add-modal').forEach(modal => {
        modal.remove();
      });
      
      // Create modal container
      const modal = document.createElement('div');
      modal.classList.add('fixed', 'inset-0', 'bg-black', 'bg-opacity-50', 'z-50', 'flex', 'items-center', 'justify-center', 'generic-add-modal');
      
      // Build form fields based on columns configuration
      let formFields = '';
      
      columns.forEach(column => {
        // Skip primary key field as it's usually auto-generated
        if (column.key === idField) return;
        
        // Handle different column types appropriately
        if (column.type === 'boolean') {
          // Checkbox for boolean values
          formFields += `
            <div class="mb-4">
              <label class="inline-flex items-center">
                <input type="checkbox" name="${column.key}" class="rounded border-gray-300">
                <span class="ml-2 text-sm font-medium text-gray-700">${column.header}</span>
              </label>
            </div>
          `;
        } else if (column.type === 'number') {
          // Number input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <input type="number" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2" value="0">
            </div>
          `;
        } else if (column.type === 'array') {
          // Handle arrays (like tags) with comma-separated input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header} (comma separated)</label>
              <input type="text" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2">
            </div>
          `;
        } else if (column.type === 'text' || column.key.includes('description')) {
          // Textarea for potentially long text
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <textarea id="${column.key}" name="${column.key}" rows="4" class="w-full rounded-md border border-gray-300 p-2"></textarea>
            </div>
          `;
        } else {
          // Default to text input
          formFields += `
            <div class="mb-4">
              <label for="${column.key}" class="block text-sm font-medium text-gray-700 mb-1">${column.header}</label>
              <input type="text" id="${column.key}" name="${column.key}" class="w-full rounded-md border border-gray-300 p-2">
            </div>
          `;
        }
      });
      
      // Create modal content with scrolling support
      const modalContent = `
        <div class="bg-white rounded-lg w-full max-w-3xl mx-4 flex flex-col h-[90vh]">
          <div class="p-4 bg-gray-50 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
            <h3 class="text-lg font-medium">Add New ${tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/s$/, '')}</h3>
            <button class="close-modal-btn text-gray-400 hover:text-gray-600">
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="overflow-y-auto custom-scroll flex-1 min-h-0">
            <form id="add-form" class="p-6">
              ${formFields}
            </form>
          </div>
          <div class="p-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-200 sticky bottom-0">
            <button type="button" class="cancel-btn py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" id="save-new-btn" class="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-700">
              Save
            </button>
          </div>
        </div>
      `;
      
      modal.innerHTML = modalContent;
      document.body.appendChild(modal);
      
      // Add event listeners for closing modal
      const closeBtn = modal.querySelector('.close-modal-btn');
      const cancelBtn = modal.querySelector('.cancel-btn');
      const form = modal.querySelector('#add-form');
      const saveBtn = modal.querySelector('#save-new-btn');
      
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
      
      // Connect save button to form submission
      saveBtn.addEventListener('click', () => {
        form.dispatchEvent(new Event('submit'));
      });
      
      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
          const formData = new FormData(form);
          const newItem = {};
          
          // Process form data
          columns.forEach(column => {
            if (column.key === idField) return; // Skip ID field
            
            let value = formData.get(column.key);
            
            // Handle different data types
            if (column.type === 'boolean') {
              value = !!formData.get(column.key); // Convert to boolean
            } else if (column.type === 'number' || typeof column.fallback === 'number') {
              value = value ? Number(value) : 0;
            } else if (column.type === 'array') {
              value = value ? value.split(',').map(item => item.trim()).filter(item => item) : [];
            } else if (value === '') {
              // Handle empty values with fallbacks if defined
              value = column.fallback !== undefined ? column.fallback : null;
            }
            
            newItem[column.key] = value;
          });
          
          // Insert item in database
          const success = await this.insertItem(tableName, newItem);
          
          if (!success) throw new Error('Failed to insert item');
          
          // Close modal
          document.body.removeChild(modal);
          
          // Show success message
          const notification = document.createElement('div');
          notification.className = 'fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 notification-toast';
          notification.innerHTML = `
            <div class="flex items-center">
              <div class="py-1"><svg class="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM6.7 9.29L9 11.6l4.3-4.3 1.4 1.42L9 14.4l-3.7-3.7 1.4-1.42z"/></svg></div>
              <div>
                <p class="text-sm">Item added successfully!</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.remove();
            // Refresh page to update data
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Error adding item:', error);
          alert(`Failed to add item: ${error.message}`);
        }
      });
    } catch (error) {
      console.error('Error showing add modal:', error);
      alert(`Could not display add form: ${error.message}`);
    }
  }
}


const tableRenderer = new DynamicTableRenderer();