# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Blissy is a mental wellness and mindfulness app built with React, TypeScript, Vite, TailwindCSS, and Supabase. The app features guided meditation, daily affirmations, mood tracking, and streak counters with a focus on calming pastel aesthetics and smooth animations.

## Development Commands

### Setup
```bash
npm i                    # Install dependencies
```

### Development
```bash
npm run dev             # Start dev server on localhost:8080
npm run build           # Production build
npm run build:dev       # Development mode build
npm run preview         # Preview production build
npm run lint            # Run ESLint
```

### Testing
This project does not currently have a test suite configured.

## Architecture Overview

### Application Structure

The app follows a standard React SPA architecture with the following key patterns:

**Authentication Flow**: `Splash → Onboarding → Auth → Home (protected routes)`

**State Management**:
- React Query (`@tanstack/react-query`) for server state and API caching
- Context API for global state (Auth, Theme)
- Component-level state with hooks

**Backend Integration**:
- Supabase for authentication, database, and real-time features
- All database queries wrapped in React Query hooks
- Row Level Security (RLS) enforced on all tables

### Key Directories

- `src/contexts/` - Global state providers (AuthContext, ThemeContext)
- `src/hooks/` - Custom React Query hooks for data fetching (affirmations, mood tracking, meditation, etc.)
- `src/integrations/supabase/` - Supabase client configuration and TypeScript types
- `src/pages/` - Top-level route components
- `src/components/` - Reusable UI components
- `src/components/ui/` - shadcn/ui component library
- `supabase/migrations/` - Database schema migrations

### Authentication

Authentication is managed through `AuthContext` which:
- Uses Supabase Auth with email/password
- Provides `signUp`, `signIn`, `signOut` methods
- Persists sessions in localStorage
- Automatically redirects authenticated users

Protected routes use the `ProtectedRoute` component wrapper.

### Theme System

The app uses a dual-layer theming approach:
1. **Light/Dark Mode**: Managed by `ThemeContext`, toggled manually, stored in localStorage as `blissy-theme`
2. **Theme Presets**: Color palette variations stored as `blissy-theme-preset`

All design tokens are defined in `src/index.css` using HSL color values with CSS variables. The design emphasizes:
- Soft pastel gradients (lavender, pink, light blue)
- Large border radius (20px+)
- Gentle animations (breathe, float, gradient-shift)
- Poppins font family

### Data Fetching Pattern

Custom hooks in `src/hooks/` follow this pattern:
```typescript
export function useResourceName() {
  return useQuery({
    queryKey: ["resource", param],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("table_name")
        .select("*");
      if (error) throw error;
      return data;
    },
  });
}
```

All Supabase queries use React Query for automatic caching, refetching, and error handling.

### Database Schema

Core tables:
- `affirmations` - Curated affirmation library
- `user_affirmations` - User's custom affirmations
- `mood_entries` - Daily mood logs
- `meditation_sessions` - Completed meditation sessions
- `meditations` - Meditation library
- `user_preferences` - Theme and customization settings
- `user_surveys` - User feedback and demographics
- Payment-related tables (from `20250118000000_add_payment_tables.sql`)

### Routing

React Router v6 is used with the following route structure:
- `/` - Splash screen (entry point)
- `/onboarding` - App introduction (3 slides)
- `/auth` - Login/signup forms
- `/home` - Main dashboard (protected)
- `/meditation`, `/meditation-library` - Meditation features (protected)
- `/affirmations` - Affirmation library (protected)
- `/profile` - User profile, mood tracking, settings (protected)
- `/subscription` - Premium features (protected)
- `/journal`, `/breathing` - Additional wellness features (protected)
- `/payment/success`, `/payment/failure` - Payment result pages

### Environment Variables

Required in `.env`:
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

## Code Conventions

### Styling
- Use Tailwind utility classes for styling
- Reference semantic tokens from `src/index.css` (e.g., `bg-primary`, `text-foreground`)
- Use HSL color format for all custom colors
- Apply generous border radius (`rounded-3xl`, `rounded-2xl`)
- Leverage built-in animations: `animate-breathe`, `animate-float`, `animate-gradient`

### TypeScript
- Strict null checks are disabled (`strictNullChecks: false`)
- Path alias `@/` maps to `src/`
- Supabase types auto-generated in `src/integrations/supabase/types.ts`

### Components
- Small, focused, single-responsibility components
- Use shadcn/ui components from `src/components/ui/`
- Prefer functional components with hooks

### Database Queries
- Always use React Query hooks for data fetching
- Isolate Supabase queries in custom hooks under `src/hooks/`
- User data is isolated by `auth.uid()` via RLS policies

## Supabase Integration

### Local Development
The project uses Lovable Cloud (managed Supabase instance). Migrations are stored in `supabase/migrations/`.

### Schema Changes
When adding new tables or modifying schema:
1. Create a new migration file in `supabase/migrations/`
2. Update `src/integrations/supabase/types.ts` if needed
3. Create corresponding React Query hooks in `src/hooks/`

### Security
- Row Level Security (RLS) enabled on all tables
- User data scoped by `auth.uid()`
- Email auto-confirmation enabled
- Protected API routes

## Deployment

The project is deployed via Lovable platform. To deploy:
1. Open the Lovable project dashboard
2. Navigate to Share → Publish

## Important Notes

- The project uses Lovable Cloud, which is a managed Supabase environment
- No tests are currently configured - add testing framework if needed
- Payment integration uses Razorpay (see hooks: `use-razorpay.ts`, `use-secure-payment.ts`)
- Component tagging via `lovable-tagger` is enabled in development mode
- ESLint has `@typescript-eslint/no-unused-vars` disabled
