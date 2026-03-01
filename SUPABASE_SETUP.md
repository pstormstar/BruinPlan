# Supabase Setup Guide

## Prerequisites
- Supabase project created
- Supabase environment variables set in `.env.local`

## Environment Variables

Create a `.env.local` file in the project root with:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

### 1. Create Plans Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Drop existing table if it already exists (optional, use if you need to reset)
-- DROP TABLE IF EXISTS plans CASCADE;

-- Create plans table to store user course plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  planner_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX plans_user_id_idx ON plans(user_id);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only read/update their own plans
CREATE POLICY "Users can view their own plans"
  ON plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own plans"
  ON plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Features Enabled

### Authentication
- Email/Password authentication is enabled by default in Supabase
- Users can sign up and sign in through the login interface

### Data Persistence
- User course plans are stored in the `plans` table
- Plans are automatically saved when users move courses around (via the `savePlan` function)
- Plans are loaded when users log in

## Testing

1. Go to your application
2. Click "Sign Up" to create a new account
3. Enter email and password
4. After signing up, you can immediately sign in
5. Add courses to your plan (they'll be saved automatically)
6. Refresh the page - your plan should persist

## Production Considerations

- Configure custom SMTP for email verification (optional but recommended)
- Set up email templates in Supabase Authentication settings
- Consider implementing auto-save behavior more explicitly
- Add error handling and retry logic for network failures
