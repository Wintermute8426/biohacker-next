-- Side effects tracking for safety monitoring
CREATE TABLE IF NOT EXISTS side_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  dose_log_id UUID, -- optional link to dose_logs(id) if that table exists
  peptide_name TEXT NOT NULL,
  injection_site TEXT CHECK (injection_site IS NULL OR injection_site IN ('abdomen', 'thigh', 'arm', 'glute')),
  site_redness BOOLEAN NOT NULL DEFAULT false,
  site_swelling BOOLEAN NOT NULL DEFAULT false,
  site_itching BOOLEAN NOT NULL DEFAULT false,
  site_bruising BOOLEAN NOT NULL DEFAULT false,
  site_pain_level INTEGER CHECK (site_pain_level IS NULL OR (site_pain_level >= 0 AND site_pain_level <= 10)),
  fatigue_level INTEGER CHECK (fatigue_level IS NULL OR (fatigue_level >= 0 AND fatigue_level <= 10)),
  headache_level INTEGER CHECK (headache_level IS NULL OR (headache_level >= 0 AND headache_level <= 10)),
  nausea BOOLEAN NOT NULL DEFAULT false,
  dizziness BOOLEAN NOT NULL DEFAULT false,
  insomnia BOOLEAN NOT NULL DEFAULT false,
  water_retention BOOLEAN NOT NULL DEFAULT false,
  joint_pain BOOLEAN NOT NULL DEFAULT false,
  appetite TEXT CHECK (appetite IS NULL OR appetite IN ('increased', 'decreased')),
  mood_changes TEXT CHECK (mood_changes IS NULL OR mood_changes IN ('none', 'positive', 'negative', 'irritable', 'euphoric')),
  severity TEXT NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_side_effects_user_created ON side_effects(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_side_effects_cycle ON side_effects(cycle_id);

ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own side_effects"
  ON side_effects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
