# BruinPlan - Supabase Authentication Integration Guide

## Overview

A complete authentication system has been integrated into BruinPlan using Supabase. Users can now:
- Sign up with email and password
- Sign in to access their saved course plans
- Plans are automatically saved when courses are moved/added
- Plans persist across sessions

## Implementation Details

### 1. Files Modified

#### `src/App.jsx`
- Added session persistence checks on app load
- Conditional rendering: shows Login component when not authenticated
- Shows planner when authenticated
- Added logout button in header with user email display
- Sets up auth state listener for session changes

#### `src/components/Login.jsx`
- Enhanced with professional UI matching UCLA branding
- Toggle between Sign In and Sign Up modes
- Email and password input fields
- Loading states and error handling
- Clear error messages for failed authentication

#### `src/store/usePlannerStore.js`
- Added user state management (currentUser, isLoading, error)
- `setCurrentUser()`: Updates current logged-in user
- `logout()`: Signs out user and resets planner state
- `loadUserPlan()`: Fetches user's saved plan from Supabase
- `savePlan()`: Saves current plan to Supabase database

#### `src/components/PlannerGrid.jsx`
- Auto-save functionality with 1-second debounce
- Plans are saved whenever user moves/adds courses
- Debouncing prevents excessive database calls

#### `src/index.css`
- Professional login page styling
- UCLA blue and gold color scheme
- Responsive design for mobile and desktop
- Logout button styling
- Error message styling
- Form input focus states

### 2. Database Setup

#### Required SQL Tables

The `plans` table needs to be created in Supabase with:
- `id` (UUID primary key)
- `user_id` (UUID, references auth.users, unique)
- `planner_data` (JSONB, stores the course plan)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Row-level security policies ensure:
- Users can only access their own plans
- Users cannot access other users' plans
- Plans are automatically deleted if user account is deleted

See `SUPABASE_SETUP.md` for complete SQL scripts.

## Setup Instructions

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and Anon Key

### Step 2: Set Environment Variables

Create `.env.local` in your project root with:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Table

1. Go to Supabase dashboard → SQL Editor
2. Create a new query
3. Copy the SQL from `SUPABASE_SETUP.md`
4. Execute the script

This will create:
- `plans` table
- Row-level security policies
- Automatic timestamp triggers
- Database indexes for performance

### Step 4: Enable Email/Password Auth

Supabase has Email/Password authentication enabled by default. No additional setup needed.

### Step 5: Test the Application

```bash
npm run dev
```

1. Go to `http://localhost:5173`
2. Click "Sign Up"
3. Enter an email and password
4. Sign in with your credentials
5. Add courses to your plan
6. Refresh the page - your plan should still be there
7. Click "Logout" to sign out

## Data Structure

### User Plan (JSONB in database)

```json
{
  "year-1-fall": [
    {
      "id": "course-1",
      "code": "MATH 101",
      "title": "Calculus I",
      "units": 4
    }
  ],
  "year-1-winter": [],
  "year-1-spring": [],
  "year-1-summer": [],
  ...
}
```

Plans use a quarter-based structure with keys like:
- `year-1-fall`, `year-1-winter`, `year-1-spring`, `year-1-summer`
- `year-2-fall`, `year-2-winter`, `year-2-spring`, `year-2-summer`
- etc.

Each quarter contains an array of courses with id, code, title, and units.

## Authentication Flow

### Sign Up
1. User enters email and password
2. Supabase creates new user account
3. After confirmation (if email verification enabled):
   - User is logged in
   - New empty plan record created
   - Planner loads with empty schedule

### Sign In
1. User enters email and password
2. Supabase verifies credentials
3. User is logged in
4. User's existing plan loads from database
5. If no plan exists, empty schedule is shown

### Auto-Save
1. User moves a course in the planner
2. PlannerGrid component detects change
3. Change is debounced (waits 1 second)
4. Plan is saved to Supabase database
5. User gets latest plan on next login

### Logout
1. User clicks "Logout" button
2. Supabase auth session is cleared
3. App returns to Login screen
4. Plan data is reset locally

## Security Features

✅ **Row-Level Security (RLS)**: Users can only read/write their own plans
✅ **Automatic Cleanup**: User data deleted when account is deleted
✅ **Secure Auth**: Supabase handles password hashing and validation
✅ **Session Tokens**: Auth managed via secure HTTP-only cookies
✅ **No Password Storage**: Supabase manages all auth securely

## Error Handling

The app handles common errors:

- **Invalid Credentials**: Clear error message on signin failure
- **Network Errors**: Graceful handling of connection issues
- **Loading States**: Users see loading indicators during auth operations
- **Database Errors**: Errors are caught and displayed to user

## Future Enhancements

### High Priority
- [ ] Email verification requirement
- [ ] Password reset functionality
- [ ] Better error messages for specific issues

### Medium Priority
- [ ] Google/GitHub OAuth login
- [ ] User profile settings
- [ ] Export plans as PDF
- [ ] Share plans with advisors

### Low Priority
- [ ] Plan versioning/history
- [ ] Collaborative planning
- [ ] Course recommendations based on plan
- [ ] Integration with UCLA course catalog API

## Testing Checklist

- [ ] Sign up creates new account
- [ ] Sign in works with correct credentials
- [ ] Wrong credentials show error
- [ ] Session persists on page refresh
- [ ] Logout clears session
- [ ] Moving courses saves plan
- [ ] Refreshing page loads saved plan
- [ ] App works on mobile
- [ ] Error messages display properly
- [ ] Loading states show during operations

## Troubleshooting

### "VITE_SUPABASE_URL is undefined"
- Check `.env.local` file exists
- Verify variable names match exactly
- Restart dev server after adding env vars

### "Unable to connect to database"
- Verify Supabase project is running
- Check internet connection
- Verify credentials in `.env.local`

### "User not authenticated"
- Ensure database `plans` table exists
- Check RLS policies are set up correctly
- Verify user ID in auth.users matches plans table

### Plans not saving
- Check browser console for errors
- Verify `plans` table exists in Supabase
- Confirm RLS policies allow writing
- Check network tab for failed requests

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

For issues or questions:
1. Check Supabase status page
2. Review browser console for errors
3. Check Supabase logs in dashboard
4. Visit Supabase Discord community
