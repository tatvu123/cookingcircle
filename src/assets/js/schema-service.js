//Auto-detects table structures from Supabase

class SchemaService {
  constructor() {
    this.schemaCache = {};
  }
  
  /**
   * Fetches and analyses schema information for a table
   */
  async getTableSchema(tableName) {
    // Return from cache if available
    if (this.schemaCache[tableName]) {
      return this.schemaCache[tableName];
    }
    
    try {
      // Get sample data to analyze structure
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (error) throw error;
      
      // Get column definitions from RPC (this is a Supabase feature)
      const { data: columnData, error: columnError } = await supabase.rpc(
        'get_column_info',
        { target_table: tableName }
      );
      
      // If RPC fails, fallback to inferring from data
      const schema = columnError ? this.inferSchemaFromData(data) : this.processColumnData(columnData);
      
      // Get primary key (needed for actions)
      const { data: pkData } = await supabase.rpc('get_primary_key', { target_table: tableName });
      if (pkData && pkData.length > 0) {
        schema.primaryKey = pkData[0].column_name;
      } else {
        // Fallback to common primary key patterns
        schema.primaryKey = this.guessPrimaryKey(schema.columns, tableName);
      }
      
      // Store in cache
      this.schemaCache[tableName] = schema;
      return schema;
    } catch (error) {
      console.error(`Error fetching schema for ${tableName}:`, error);
      // Fallback - try to get a few rows and infer schema
      return this.inferSchemaFromSample(tableName);
    }
  }
  
  /**
   * Process column metadata from Supabase RPC
   */
  processColumnData(columnData) {
    const columns = {};
    
    if (Array.isArray(columnData)) {
      columnData.forEach(col => {
        columns[col.column_name] = {
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          isPrimaryKey: col.constraint_type === 'PRIMARY KEY'
        };
      });
    }
    
    return { columns };
  }
  
  /**
   * Infer schema from a data sample when metadata isn't available
   */
  inferSchemaFromData(data) {
    const columns = {};
    
    if (data && data.length > 0) {
      const sample = data[0];
      
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        columns[key] = {
          type: this.inferDataType(value),
          nullable: value === null,
          isPrimaryKey: key.endsWith('_id') || key === 'id'
        };
      });
    }
    
    return { columns };
  }
  
  /**
   * Fetch a sample of data and infer schema as a fallback
   */
  async inferSchemaFromSample(tableName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(5);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const schema = this.inferSchemaFromData(data);
        this.schemaCache[tableName] = schema;
        return schema;
      }
      
      return { columns: {} };
    } catch (error) {
      console.error(`Error inferring schema for ${tableName}:`, error);
      return { columns: {} };
    }
  }
  
  /**
   * Infer data type from a value
   */
  inferDataType(value) {
    if (value === null) return 'unknown';
    
    const type = typeof value;
    
    if (type === 'number') {
      return Number.isInteger(value) ? 'integer' : 'numeric';
    }
    
    if (type === 'boolean') return 'boolean';
    
    if (type === 'string') {
      // Check if it's a date
      if (!isNaN(Date.parse(value))) {
        return 'timestamp';
      }
      
      // Check if it's a URL
      if (value.match(/^(https?:\/\/)/)) {
        return 'url';
      }
      
      // Check if it might be JSON
      if ((value.startsWith('{') && value.endsWith('}')) || 
          (value.startsWith('[') && value.endsWith(']'))) {
        try {
          JSON.parse(value);
          return 'json';
        } catch (e) {
          // Not valid JSON
        }
      }
      
      return 'text';
    }
    
    if (type === 'object') {
      if (Array.isArray(value)) return 'array';
      return 'json';
    }
    
    return 'unknown';
  }
  
  /**
   * Make an educated guess about the primary key
   */
  guessPrimaryKey(columns, tableName) {
    // Common primary key patterns in order of likelihood
    const candidates = [
      `${tableName.slice(0, -1)}_id`, // singular_id (e.g., "recipe_id" for "recipes")
      'id',
      'uuid',
      'key',
      'uid'
    ];
    
    for (const candidate of candidates) {
      if (columns[candidate]) {
        return candidate;
      }
    }
    
    // Look for a column ending with _id
    for (const key of Object.keys(columns)) {
      if (key.endsWith('_id')) {
        return key;
      }
    }
    
    // Default to the first column if nothing else found
    return Object.keys(columns)[0] || 'id';
  }
}

const schemaService = new SchemaService();