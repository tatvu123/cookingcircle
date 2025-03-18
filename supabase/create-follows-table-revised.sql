-- 創建追蹤關係表
CREATE TABLE IF NOT EXISTS user_follows (
  follow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES auth.users(id), -- 關注者
  following_id UUID NOT NULL REFERENCES auth.users(id), -- 被關注者
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 確保一個用戶不會重複關注同一個人
  UNIQUE(follower_id, following_id)
);

-- 在 auth.users 表中添加計數欄位
ALTER TABLE auth.users 
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 創建索引以加快查詢
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);

-- 啟用行級安全性
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

-- 設置關注表的權限策略
CREATE POLICY user_follows_select ON user_follows 
  FOR SELECT USING (true); -- 所有人都可以查看關注關係

CREATE POLICY user_follows_insert ON user_follows 
  FOR INSERT WITH CHECK (auth.uid() = follower_id); -- 只能添加自己的關注

CREATE POLICY user_follows_delete ON user_follows 
  FOR DELETE USING (auth.uid() = follower_id); -- 只能刪除自己的關注

-- 創建觸發器更新計數欄位
CREATE OR REPLACE FUNCTION update_followers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 增加被關注者的追蹤者數量
    UPDATE auth.users SET followers_count = followers_count + 1 
    WHERE id = NEW.following_id;
    
    -- 增加關注者的正在關注數量
    UPDATE auth.users SET following_count = following_count + 1 
    WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- 減少被關注者的追蹤者數量
    UPDATE auth.users SET followers_count = followers_count - 1 
    WHERE id = OLD.following_id;
    
    -- 減少關注者的正在關注數量
    UPDATE auth.users SET following_count = following_count - 1 
    WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 添加觸發器
CREATE TRIGGER user_follows_count_trigger
AFTER INSERT OR DELETE ON user_follows
FOR EACH ROW
EXECUTE FUNCTION update_followers_count();

-- 授予權限
GRANT SELECT, INSERT, DELETE ON user_follows TO authenticated;
GRANT SELECT ON user_follows TO anon; 