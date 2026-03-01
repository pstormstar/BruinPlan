# Supabase Setup Guide

## 1. Create a Supabase Project
- Go to [https://app.supabase.com/](https://app.supabase.com/) and sign in.
- Click **New Project**.
- Fill in the project name, password, and select a region.
- Wait for the project to initialize.

## 2. Get API Keys
- In your Supabase project, go to **Project Settings > API**.
- Copy the **Project URL** and **anon public key**.

## 3. Configure Authentication
- Go to **Authentication > Providers**.
- Enable **Email** authentication.
- (Optional) Set up SMTP for production email sending.

## 4. Create the `plans` Table
- Go to the **SQL Editor** in your Supabase dashboard.
- Run the following SQL to create the table with the correct schema:

  ```sql
  DROP TABLE IF EXISTS plans CASCADE;

  CREATE TABLE IF NOT EXISTS plans (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    planner_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```

## 5. Enable Row Level Security (RLS) and Add Policies
- In the SQL Editor, run:

  ```sql
  ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

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
  ```

## 6. Add Environment Variables
- In your project root, create a `.env.local` file:
  ```
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```
- Replace with your actual values from step 2.

## 7. Test Locally
- Run `npm run dev` and verify authentication and planner saving work.

## 8. (Optional) Deploy
- See `VERCEL_DEPLOY.md` for deployment instructions.
