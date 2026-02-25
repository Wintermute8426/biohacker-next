-- dose_schedules: defines when doses are due (per cycle)
CREATE TABLE IF NOT EXISTS dose_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  peptide_name TEXT NOT NULL,
  dosage_amount TEXT,
  dosage_unit TEXT DEFAULT 'mcg',
  scheduled_time TEXT NOT NULL, -- e.g. '08:00' or '20:00' (24h or store as-is)
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dose_schedules_user_active ON dose_schedules(user_id, active);
CREATE INDEX IF NOT EXISTS idx_dose_schedules_cycle ON dose_schedules(cycle_id);

ALTER TABLE dose_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dose_schedules"
  ON dose_schedules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- dose_logs: records when a dose was taken (or skipped)
CREATE TABLE IF NOT EXISTS dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES dose_schedules(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  taken_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  peptide_name TEXT,
  dosage_amount TEXT,
  dosage_unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dose_logs_user_scheduled ON dose_logs(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_dose_logs_schedule ON dose_logs(schedule_id);

ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dose_logs"
  ON dose_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trigger: set taken_at on insert when not skipped
CREATE OR REPLACE FUNCTION dose_logs_set_taken_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.skipped = false AND NEW.taken_at IS NULL THEN
    NEW.taken_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dose_logs_set_taken_at_trigger ON dose_logs;
CREATE TRIGGER dose_logs_set_taken_at_trigger
  BEFORE INSERT ON dose_logs
  FOR EACH ROW EXECUTE FUNCTION dose_logs_set_taken_at();
