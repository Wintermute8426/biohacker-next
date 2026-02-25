-- Cycle journal: daily subjective tracking per cycle
CREATE TABLE IF NOT EXISTS cycle_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 10),
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  recovery INTEGER NOT NULL CHECK (recovery >= 1 AND recovery <= 10),
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  focus INTEGER NOT NULL CHECK (focus >= 1 AND focus <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cycle_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_cycle_journal_user_cycle ON cycle_journal(user_id, cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_journal_entry_date ON cycle_journal(cycle_id, entry_date DESC);

ALTER TABLE cycle_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own cycle_journal"
  ON cycle_journal FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
