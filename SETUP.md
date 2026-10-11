# ZimCommerce — Phase 1 Setup

## Local testing steps

### 1. Install dependencies
```
cd C:\Users\ayahk\Desktop\zim-commerce
npm install
```

### 2. Create a Supabase project
1. Go to https://supabase.com → New project
2. Settings → API → copy **Project URL** and **anon public** key

### 3. Run the database migration
In Supabase dashboard → SQL Editor → paste the contents of:
```
supabase/migrations/001_initial.sql
```
Click **Run**. This creates the `profiles` table, RLS policies, and auto-create trigger.

### 4. Configure environment
```
cp .env.local.example .env.local
```
Edit `.env.local` and fill in your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. (Optional) Disable email confirmation for easier local testing
Supabase dashboard → Authentication → Providers → Email → disable **Confirm email**.
This lets you sign in immediately after sign-up without clicking a verification link.

### 6. Start the dev server
```
npm run dev
```
Open http://localhost:3000

---

## What to test

| Action | Expected behaviour |
|---|---|
| Visit `/` | Redirect to `/sign-in` |
| Sign up as Customer/Seller/Courier | Role cards highlight on selection; on submit, redirects to `/sign-in` with "check your email" notice |
| Sign in | Redirects to `/dashboard` |
| Dashboard | Shows role badge, welcome message, quick links |
| Click Profile | Shows name, email, role; edit form saves to Supabase |
| Sign out | Redirects to `/sign-in` |
| Visit `/dashboard` while signed out | Redirect to `/sign-in` |
| Visit `/sign-in` while signed in | Redirect to `/dashboard` |

---

## File index

| File | Purpose |
|---|---|
| `supabase/migrations/001_initial.sql` | DB schema: profiles table, RLS, trigger |
| `src/middleware.ts` | Route protection — unauth → sign-in, auth hitting auth pages → dashboard |
| `src/lib/supabase/client.ts` | Browser-side Supabase client |
| `src/lib/supabase/server.ts` | Server-side Supabase client (cookies) |
| `src/types/index.ts` | Shared TypeScript types |
| `src/app/(auth)/layout.tsx` | Branded background wrapper for auth pages |
| `src/app/(auth)/sign-in/page.tsx` | Sign-in page |
| `src/app/(auth)/sign-in/actions.ts` | `signIn` + `signOut` server actions |
| `src/app/(auth)/sign-up/page.tsx` | Sign-up page |
| `src/app/(auth)/sign-up/actions.ts` | `signUp` server action |
| `src/app/auth/callback/route.ts` | Email verification redirect handler |
| `src/app/(dashboard)/layout.tsx` | Top nav wrapper, auth guard |
| `src/app/(dashboard)/dashboard/page.tsx` | Role-aware home dashboard |
| `src/app/(dashboard)/profile/page.tsx` | Profile view page |
| `src/app/(dashboard)/profile/actions.ts` | `updateProfile` server action |
| `src/components/auth/sign-in-form.tsx` | Client form with `useActionState` |
| `src/components/auth/sign-up-form.tsx` | Client form + role card selector |
| `src/components/profile/profile-form.tsx` | Editable profile fields |
| `src/components/layout/top-nav.tsx` | Sticky navigation bar |
