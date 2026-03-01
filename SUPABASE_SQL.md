# Supabase SQL for BruinPlan

Below is the SQL to create the required table for user plans in your Supabase project. Run this in the SQL editor in your Supabase dashboard.

```sql
-- Table: plans
create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  planner_data jsonb not null,
  updated_at timestamptz default now(),
  name text default 'My Plan'
);

-- Index for fast lookup by user
create index if not exists plans_user_id_idx on plans(user_id);
```

## Notes
- `user_id` references the built-in Supabase `auth.users` table.
- `planner_data` stores the planner state as JSON.
- You can add more fields as needed (e.g., for sharing, versioning, etc).
