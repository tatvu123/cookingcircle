-- 建立營養成分資料表
CREATE TABLE IF NOT EXISTS recipe_nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    calories DECIMAL(10, 2),
    protein DECIMAL(10, 2),
    carbohydrates DECIMAL(10, 2),
    fat DECIMAL(10, 2),
    fiber DECIMAL(10, 2),
    sugar DECIMAL(10, 2),
    sodium DECIMAL(10, 2),
    cholesterol DECIMAL(10, 2),
    serving_size VARCHAR(100),
    servings_per_recipe INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id)
);

-- 為了提高查詢效率，添加索引
CREATE INDEX IF NOT EXISTS idx_recipe_nutrition_recipe_id ON recipe_nutrition(recipe_id);

-- 添加註釋
COMMENT ON TABLE recipe_nutrition IS '食譜營養成分資料表';
COMMENT ON COLUMN recipe_nutrition.id IS '營養資訊唯一識別碼';
COMMENT ON COLUMN recipe_nutrition.recipe_id IS '關聯的食譜ID';
COMMENT ON COLUMN recipe_nutrition.calories IS '每份卡路里（千卡）';
COMMENT ON COLUMN recipe_nutrition.protein IS '每份蛋白質（克）';
COMMENT ON COLUMN recipe_nutrition.carbohydrates IS '每份碳水化合物（克）';
COMMENT ON COLUMN recipe_nutrition.fat IS '每份脂肪（克）';
COMMENT ON COLUMN recipe_nutrition.fiber IS '每份纖維（克）';
COMMENT ON COLUMN recipe_nutrition.sugar IS '每份糖（克）';
COMMENT ON COLUMN recipe_nutrition.sodium IS '每份鈉（毫克）';
COMMENT ON COLUMN recipe_nutrition.cholesterol IS '每份膽固醇（毫克）';
COMMENT ON COLUMN recipe_nutrition.serving_size IS '每份量描述';
COMMENT ON COLUMN recipe_nutrition.servings_per_recipe IS '食譜總份數';
COMMENT ON COLUMN recipe_nutrition.created_at IS '記錄創建時間';
COMMENT ON COLUMN recipe_nutrition.updated_at IS '記錄更新時間'; 