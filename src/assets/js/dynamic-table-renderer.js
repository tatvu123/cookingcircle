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
    
    // Event delegation for all table actions
    document.addEventListener('click', async (e) => {
      // Support both the generic table-action-btn class and specific action classes
      const isActionButton = e.target.classList.contains('table-action-btn') || 
                            e.target.classList.contains('view-recipe-btn') ||
                            e.target.classList.contains('delete-recipe-btn');
      
      // If it's not an action button or it's already been handled, exit early
      if (!e.target || !isActionButton || e.recipeActionHandled) return;
      
      // Mark this event as handled to prevent duplicate processing
      e.recipeActionHandled = true;
      e.preventDefault();
      
      let action, tableType, itemId;
      
      // Handle original view-recipe-btn and delete-recipe-btn classes
      if (e.target.classList.contains('view-recipe-btn')) {
        action = 'view';
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
            await this.deleteItem(config.tableName, config.idField, itemId);
            // Refresh table
            const container = e.target.closest('[data-table-type]');
            if (container) {
              await this.renderTable(container, config);
            }
          }
          break;
          
        case 'view':
          if (tableType === 'recipes') {
            try {
              // First increment the view count directly
              if (typeof incrementRecipeViews === 'function') {
                await incrementRecipeViews(itemId);
              }
              
              // show the modal
              if (typeof showRecipeDetail === 'function') {
                await showRecipeDetail(itemId);
              } else {
                console.error('showRecipeDetail function is not available');
              }
            } catch (error) {
              console.error('Error showing recipe detail:', error);
              alert(`Could not show recipe details. Error: ${error.message}`);
            }
          } else {
            // Fall back to the configured handler for other table types
            const viewAction = config.actions.find(a => a.action === 'view');
            if (viewAction && viewAction.handler && typeof window[viewAction.handler] === 'function') {
              await window[viewAction.handler](itemId);
            } else {
              // Last resort fallback - simple alert
              console.log(`No handler found for viewing ${tableType} item ${itemId}`);
              const item = await this.fetchItemById(config.tableName, config.idField, itemId);
              if (item) {
                alert(`Details for ${tableType} item: ${JSON.stringify(item.title || item.name || item[config.idField], null, 2)}`);
              }
            }
          }
          break;
      }
    }, true);
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
  

  async renderTable(container, config) {
    container.classList.add('overflow-auto');
    let table = container.querySelector('table');
    if (!table) {
      container.innerHTML = `
        <div class="table-wrapper">
          <div class="table-responsive custom-scroll">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10">
                <tr>
                  ${config.columns.map(col => 
                    `<th scope="col" class="px-6 py-3 text-start text-sm text-default-500">${col.header}</th>`
                  ).join('')}
                  ${config.actions && config.actions.length ? '<th scope="col" class="px-6 py-3 text-end text-sm text-default-500">Actions</th>' : ''}
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
      table = container.querySelector('table');
    }
    
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

    // The rest of your code for rendering rows...
    
    // Add fixed height with vertical scrolling for tables with more than 5 rows
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
}

const tableRenderer = new DynamicTableRenderer();