# Supabase SQL for BruinPlan

Below is the idempotent SQL to create the required table, index, RLS policies, and trigger for user plans in your Supabase project. Run this in the SQL editor in your Supabase dashboard.

```sql
-- Drop existing table if it already exists (optional, use if you need to reset)
-- DROP TABLE IF EXISTS plans CASCADE;

-- Create plans table to store user course plans (user_id is the primary key)
CREATE TABLE IF NOT EXISTS plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  planner_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup (not strictly needed since user_id is PK)
CREATE INDEX IF NOT EXISTS plans_user_id_idx ON plans(user_id);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only read/update their own plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own plans' AND tablename = 'plans'
  ) THEN
    CREATE POLICY "Users can view their own plans"
      ON plans FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own plans' AND tablename = 'plans'
  ) THEN
    CREATE POLICY "Users can insert their own plans"
      ON plans FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own plans' AND tablename = 'plans'
  ) THEN
    CREATE POLICY "Users can update their own plans"
      ON plans FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own plans' AND tablename = 'plans'
  ) THEN
    CREATE POLICY "Users can delete their own plans"
      ON plans FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_plans_updated_at'
  ) THEN
    CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
```

## Notes
- `user_id` is now the primary key and references the built-in Supabase `auth.users` table.
- `planner_data` stores the planner state as JSON.
- All statements are idempotent and safe to run multiple times.
