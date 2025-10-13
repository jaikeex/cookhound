-- Upsert user preferences, merging new settings with existing ones
-- Parameters:
--   $1 :: int    – userId (user ID)
--   $2 :: jsonb  – settings (new settings to merge)
--
-- Merges the provided settings with existing ones using JSONB concatenation operator.
INSERT INTO user_preferences (user_id, settings, updated_at)
VALUES ($1, $2::jsonb, NOW())
ON CONFLICT (user_id) DO UPDATE
SET settings = user_preferences.settings || EXCLUDED.settings,
    updated_at = NOW();
