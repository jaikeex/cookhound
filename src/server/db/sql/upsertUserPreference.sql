INSERT INTO user_preferences (user_id, settings, updated_at)
VALUES ($1, $2::jsonb, NOW())
ON CONFLICT (user_id) DO UPDATE
SET settings = user_preferences.settings || EXCLUDED.settings,
    updated_at = NOW();
