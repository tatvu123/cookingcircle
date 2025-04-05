class ConfigGenerator {
  constructor() {
    this.defaultActions = [
      { text: 'View', class: 'text-primary hover:text-sky-700 mr-3', action: 'view' },
      { text: 'Delete', class: 'text-red-500 hover:text-red-700', action: 'delete', confirmMessage: 'Are you sure?' }
    ];
    
    // Common field display configurations
    this.fieldRenderers = {
      'timestamp': (item, field) => item[field] ? new Date(item[field]).toLocaleString() : '',
      'date': (item, field) => item[field] ? new Date(item[field]).toLocaleDateString() : '',
      'boolean': (item, field) => item[field] ? 'Yes' : 'No',
      'url': (item, field) => {
        if (!item[field]) return '';
        if (field.includes('image') || field.includes('avatar') || field.includes('photo')) {
          return `<img src="${item[field]}" alt="" class="h-10 w-10 rounded object-cover">`;
        }
        return `<a href="${item[field]}" target="_blank" class="text-primary hover:underline">${this.truncateText(item[field])}</a>`;
      },
      'array': (item, field) => Array.isArray(item[field]) ? item[field].join(', ') : ''
    };
    
    // Special column handling based on naming patterns
    this.specialColumns = {
      'image_url': (item) => item.image_url ? 
        `<img src="${item.image_url}" alt="" class="h-10 w-10 rounded-md object-cover">` : '',
      'avatar_url': (item) => item.avatar_url ? 
        `<img src="${item.avatar_url}" alt="" class="h-10 w-10 rounded-full object-cover">` : '',
      'created_at': (item) => item.created_at ? new Date(item.created_at).toLocaleString() : '',
      'updated_at': (item) => item.updated_at ? new Date(item.updated_at).toLocaleString() : ''
    };
  }
  
  /**
   * Generate a column configuration based on schema
   */
  async generateConfig(tableName, customConfig = {}) {
    const schema = await schemaService.getTableSchema(tableName);
    
    if (!schema || !schema.columns || Object.keys(schema.columns).length === 0) {
      console.error(`Could not generate configuration for ${tableName}: No schema information available`);
      return null;
    }
    
    // Format table name for display
    const title = this.formatTableName(tableName);
    
    // Build column configurations
    const columns = this.generateColumns(schema);
    
    // Configure primary key and actions
    const idField = schema.primaryKey || 'id';
    
    // Create a default configuration
    const defaultConfig = {
      tableName,
      idField,
      title,
      columns,
      actions: [...this.defaultActions],
      orderBy: { column: 'created_at', ascending: false }
    };
    
    // Configure action handlers
    defaultConfig.actions = defaultConfig.actions.map(action => {
      if (action.action === 'view') {
        action.handler = `show${this.singularize(tableName)}Detail`;
      }
      return action;
    });
    
    // Override with any custom configuration
    const config = this.mergeConfigs(defaultConfig, customConfig);
    
    return config;
  }
  
  /**
   * Generate column configurations from schema
   */
  generateColumns(schema) {
    const columns = [];
    const columnKeys = Object.keys(schema.columns);
    
    // Filter out less important columns for display
    const skipColumns = ['updated_at', 'deleted_at'];
    const displayColumns = columnKeys.filter(key => !skipColumns.includes(key));
    
    // Special handling for common display patterns
    const nameColumn = this.findNameColumn(displayColumns);
    
    if (nameColumn) {
      // Handle "name" column specially as the first column with extra info
      columns.push(this.generateNameColumn(nameColumn, schema));
      
      // Filter out columns that might be included in the name display
      const skipInRest = [nameColumn, 'image_url', 'avatar_url', 'photo_url', 'description'];
      const remainingColumns = displayColumns.filter(col => !skipInRest.includes(col));
      
      // Add the rest of the columns
      for (const column of remainingColumns) {
        columns.push(this.generateColumnConfig(column, schema.columns[column]));
      }
    } else {
      // No special name column found, just add all columns
      for (const column of displayColumns) {
        columns.push(this.generateColumnConfig(column, schema.columns[column]));
      }
    }
    
    return columns;
  }
  
  /**
   * Find the best column to use as the "name" column
   */
  findNameColumn(columns) {
    // Common name patterns in order of preference
    const nameCandidates = ['name', 'title', 'full_name', 'username', 'email', 'label'];
    
    for (const candidate of nameCandidates) {
      if (columns.includes(candidate)) {
        return candidate;
      }
    }
    
    return null;
  }
  
  /**
   * Generate a special "name" column that includes additional info
   */
  generateNameColumn(nameColumn, schema) {
    // Find potential image and description columns
    const imageColumn = ['image_url', 'avatar_url', 'photo_url'].find(col => schema.columns[col]);
    const descColumn = ['description', 'summary', 'subtitle', 'tagline'].find(col => schema.columns[col]);
    
    return {
      key: nameColumn,
      header: this.formatColumnName(nameColumn),
      render: (item) => {
        let html = '<div class="flex items-center">';
        
        // Add image if available
        if (imageColumn && item[imageColumn]) {
          html += `
            <div class="flex-shrink-0 h-10 w-10 mr-3">
              <img class="h-10 w-10 rounded-md object-cover" src="${item[imageColumn]}" alt="">
            </div>
          `;
        }
        
        html += '<div>';
        
        // Add main name/title
        html += `${item[nameColumn] || 'Untitled'}`;
        
        // Add description if available
        if (descColumn && item[descColumn]) {
          const desc = typeof item[descColumn] === 'string' ? item[descColumn] : String(item[descColumn]);
          const shortDesc = this.truncateText(desc, 60);
          html += `<p class="text-xs text-gray-500">${shortDesc}</p>`;
        }
        
        html += '</div></div>';
        
        return html;
      }
    };
  }
  
  /**
   * Generate a standard column configuration
   */
  generateColumnConfig(column, schemaInfo) {
    // Skip image columns as they're handled specially
    if (['image_url', 'avatar_url', 'photo_url'].includes(column)) {
      return null;
    }
    
    // Basic column config
    const config = {
      key: column,
      header: this.formatColumnName(column),
      fallback: column.includes('count') ? 0 : ''
    };
    
    // Foreign key detection - common patterns
    if (column === 'recipe_id' || column.endsWith('_recipe_id')) {
      config.render = async (item) => {
        const value = item[column];
        return await foreignKeyResolver.resolve('recipe_id', value);
      };
      return config;
    }
    
    // Special column handler based on name
    if (this.specialColumns[column]) {
      config.render = (item) => this.specialColumns[column](item);
      return config;
    }
    
    // Type-based renderer
    if (schemaInfo && this.fieldRenderers[schemaInfo.type]) {
      config.render = (item) => this.fieldRenderers[schemaInfo.type](item, column);
      return config;
    }
    
    // Special handling for known patterns
    if (column.endsWith('_count')) {
      config.render = (item) => item[column] || 0;
      return config;
    }
    
    if (column.endsWith('_time') || column.includes('duration')) {
      config.render = (item) => item[column] ? `${item[column]} mins` : 'N/A';
      return config;
    }
    
    return config;
  }
  
  /**
   * Format a table name for display (e.g. "user_posts" → "User Posts")
   */
  formatTableName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Format a column name for display (e.g. "first_name" → "First Name")
   */
  formatColumnName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Convert plural table name to singular (e.g. "recipes" → "Recipe")
   */
  singularize(name) {
    const formatted = this.formatTableName(name);
    // Simple English singularization rules
    if (formatted.endsWith('ies')) {
      return formatted.slice(0, -3) + 'y';
    }
    if (formatted.endsWith('s')) {
      return formatted.slice(0, -1);
    }
    return formatted;
  }
  
  /**
   * Truncate text to a specific length with ellipsis
   */
  truncateText(text, length = 30) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  }
  
  /**
   * Merge custom config with auto-generated config
   */
  mergeConfigs(defaultConfig, customConfig) {
    const result = { ...defaultConfig };
    
    // Handle special merging for columns
    if (customConfig.columns) {
      // Map custom columns by key for easy lookup
      const customColumnsMap = {};
      customConfig.columns.forEach(col => {
        customColumnsMap[col.key] = col;
      });
      
      // Apply custom column settings where provided
      result.columns = result.columns.map(col => {
        if (customColumnsMap[col.key]) {
          return { ...col, ...customColumnsMap[col.key] };
        }
        return col;
      });
      
      // Add any additional columns from custom config
      const existingKeys = result.columns.map(col => col.key);
      const additionalColumns = customConfig.columns.filter(col => !existingKeys.includes(col.key));
      result.columns = [...result.columns, ...additionalColumns];
    }
    
    // Merge other properties
    Object.keys(customConfig).forEach(key => {
      if (key !== 'columns') {
        result[key] = customConfig[key];
      }
    });
    
    return result;
  }
}

const configGenerator = new ConfigGenerator();