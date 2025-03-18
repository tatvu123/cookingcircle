-- 創建營養成分表
CREATE TABLE IF NOT EXISTS recipe_nutrition (
  nutrition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  calories INTEGER NOT NULL DEFAULT 0,      -- 卡路里 (kcal)
  protein DECIMAL(8, 2) NOT NULL DEFAULT 0, -- 蛋白質 (g)
  carbohydrates DECIMAL(8, 2) NOT NULL DEFAULT 0, -- 碳水化合物 (g)
  fat DECIMAL(8, 2) NOT NULL DEFAULT 0,     -- 脂肪 (g)
  fiber DECIMAL(8, 2) NOT NULL DEFAULT 0,   -- 纖維素 (g)
  
  -- 可選的額外營養素
  sugar DECIMAL(8, 2),                      -- 糖 (g)
  sodium DECIMAL(8, 2),                     -- 鈉 (mg)
  cholesterol DECIMAL(8, 2),                -- 膽固醇 (mg)
  calcium DECIMAL(8, 2),                    -- 鈣 (mg)
  iron DECIMAL(8, 2),                       -- 鐵 (mg)
  vitamin_a DECIMAL(8, 2),                  -- 維生素A (IU)
  vitamin_c DECIMAL(8, 2),                  -- 維生素C (mg)
  
  -- 每份的資訊
  serving_size VARCHAR(100),                -- 每份大小 (例如: "1 slice", "100g")
  servings_per_recipe INTEGER DEFAULT 1,    -- 每個食譜的份數
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 確保每個食譜只有一個營養成分記錄
  UNIQUE(recipe_id)
);

-- 創建索引以加快查詢
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe_id ON recipe_nutrition(recipe_id);

-- 啟用行級安全性
ALTER TABLE recipe_nutrition ENABLE ROW LEVEL SECURITY;

-- 設置權限策略
CREATE POLICY recipe_nutrition_select ON recipe_nutrition
  FOR SELECT USING (true); -- 所有人都可以查看營養成分

-- 只有管理員或食譜創建者可以修改營養成分
CREATE POLICY recipe_nutrition_insert ON recipe_nutrition
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.recipe_id = recipe_nutrition.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY recipe_nutrition_update ON recipe_nutrition
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.recipe_id = recipe_nutrition.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

CREATE POLICY recipe_nutrition_delete ON recipe_nutrition
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.recipe_id = recipe_nutrition.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- 自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_nutrition_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_nutrition_timestamp
BEFORE UPDATE ON recipe_nutrition
FOR EACH ROW
EXECUTE FUNCTION update_nutrition_timestamp();

-- 授予權限
GRANT SELECT ON recipe_nutrition TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON recipe_nutrition TO authenticated; 