-- Create recipe_likes table to record user likes
CREATE TABLE IF NOT EXISTS recipe_likes (
  like_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user cannot like the same recipe twice
  UNIQUE(user_id, recipe_id)
);

-- Create recipe_views table to record recipe views
CREATE TABLE IF NOT EXISTS recipe_views (
  view_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id),
  user_id UUID REFERENCES auth.users(id), -- Optional, can be NULL for anonymous views
  ip_address TEXT, -- Store IP address for anonymous users (hashed for privacy)
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add summary columns to recipes table for efficient counting
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_recipe_likes_recipe_id ON recipe_likes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_likes_user_id ON recipe_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_views_recipe_id ON recipe_views(recipe_id);

-- Add RLS policies for recipe_likes
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;

-- Policy for users to read likes
CREATE POLICY recipe_likes_select ON recipe_likes 
  FOR SELECT USING (true); -- Anyone can see who liked recipes

-- Policy for users to add likes
CREATE POLICY recipe_likes_insert ON recipe_likes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own likes
CREATE POLICY recipe_likes_delete ON recipe_likes 
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for recipe_views
ALTER TABLE recipe_views ENABLE ROW LEVEL SECURITY;

-- Policy for users to read view data
CREATE POLICY recipe_views_select ON recipe_views 
  FOR SELECT USING (true); -- Anyone can see view stats

-- Policy for adding views
CREATE POLICY recipe_views_insert ON recipe_views 
  FOR INSERT WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, DELETE ON recipe_likes TO authenticated;
GRANT SELECT, INSERT ON recipe_views TO authenticated;
GRANT SELECT ON recipe_views TO anon;

-- Create functions to update the counter columns

-- Function to update likes_count when a recipe is liked/unliked
CREATE OR REPLACE FUNCTION update_recipe_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes SET likes_count = likes_count + 1 WHERE recipe_id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipes SET likes_count = likes_count - 1 WHERE recipe_id = OLD.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update views_count when a recipe is viewed
CREATE OR REPLACE FUNCTION update_recipe_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipes SET views_count = views_count + 1 WHERE recipe_id = NEW.recipe_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER recipe_likes_count_trigger
AFTER INSERT OR DELETE ON recipe_likes
FOR EACH ROW
EXECUTE FUNCTION update_recipe_likes_count();

CREATE TRIGGER recipe_views_count_trigger
AFTER INSERT ON recipe_views
FOR EACH ROW
EXECUTE FUNCTION update_recipe_views_count(); 