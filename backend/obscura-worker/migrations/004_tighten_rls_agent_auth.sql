-- ============================================================
-- Obscura — tighten RLS for agent-auth production (004)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Activity: deny direct anon reads — frontend/MCP use obscura-api /agent/activity
DROP POLICY IF EXISTS "allow_participant_read" ON obscura_activity;
CREATE POLICY "deny_anon_read"
  ON obscura_activity
  FOR SELECT
  USING (false);

-- Notification prefs: deny direct anon reads — use GET /agent/prefs via API
DROP POLICY IF EXISTS "wallet_read_own" ON obscura_notification_prefs;
CREATE POLICY "deny_anon_read_prefs"
  ON obscura_notification_prefs
  FOR SELECT
  USING (false);
