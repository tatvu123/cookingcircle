-- Create recipe_collections table for saving favorite/collected recipes
CREATE TABLE IF NOT EXISTS recipe_collections (
  collection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user cannot collect the same recipe twice
  UNIQUE(user_id, recipe_id)
);

-- Optional: Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipe_collections_user_id ON recipe_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_recipe_id ON recipe_collections(recipe_id);

-- Add RLS policies so users can only see and manage their own collections
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own collections
CREATE POLICY recipe_collections_select ON recipe_collections 
  FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to insert their own collections
CREATE POLICY recipe_collections_insert ON recipe_collections 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own collections
CREATE POLICY recipe_collections_delete ON recipe_collections 
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON recipe_collections TO authenticated; 