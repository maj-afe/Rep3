# 🌸 Blissy - Mental Wellness & Mindfulness App

A beautiful, calming mental wellness app designed for personal use. Built with React, TypeScript, and Lovable Cloud (Supabase).

## ✨ Features

### 🧘 Guided Meditation
- Timer-based meditation sessions
- Visual progress tracking
- Breathing exercises and tips
- Session completion tracking

### 💗 Daily Affirmations
- Curated affirmation library
- Categories: Confidence, Peace, Focus, Gratitude
- Random affirmation generator
- Favorite affirmations
- Add custom affirmations

### 📊 Mood Tracking
- Log daily mood (5-level scale)
- Weekly mood visualization
- Mood history and patterns
- Optional mood notes

### 🔥 Streak Counter
- Track consecutive days of engagement
- Achievement badges
- Progress milestones

### 🌓 Dark Mode
- Seamless theme switching
- Beautiful light and dark palettes
- Persistent theme preferences

### 🔐 Authentication
- Email/password signup & login
- Secure user sessions
- Protected routes

## 🎨 Design Philosophy

- **Soft Pastels**: Lavender, light blue, pink gradients
- **Rounded Corners**: 20px+ border radius throughout
- **Gentle Animations**: Fade, float, breathe effects
- **Poppins Font**: Clean, modern typography
- **Mobile-First**: Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS with custom design tokens
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth
- **State Management**: React Query + Context API
- **UI Components**: shadcn/ui + custom components

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── BottomNav.tsx    # Bottom navigation
│   └── ProtectedRoute.tsx # Auth guard
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── hooks/
│   ├── use-affirmations.ts    # Affirmations data
│   ├── use-mood-tracking.ts   # Mood tracking logic
│   └── use-toast.ts           # Toast notifications
├── pages/
│   ├── Splash.tsx       # Welcome screen
│   ├── Onboarding.tsx   # App introduction
│   ├── Auth.tsx         # Login/Signup
│   ├── Home.tsx         # Dashboard
│   ├── Meditation.tsx   # Meditation timer
│   ├── Affirmations.tsx # Affirmation library
│   ├── Profile.tsx      # User profile & settings
│   └── Subscription.tsx # Premium features
└── index.css            # Design system tokens
```

## 🗄️ Database Schema

### Tables
- `affirmations` - Curated affirmation library
- `user_affirmations` - Custom user affirmations
- `mood_entries` - Daily mood logs
- `meditation_sessions` - Completed meditation sessions
- `meditations` - Meditation library
- `user_preferences` - Theme & customization settings
- `user_surveys` - User feedback & demographics

## 🚀 Getting Started

### Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### Deployment

Simply open [Lovable](https://lovable.dev/projects/c90ecd6d-ab76-480e-8054-99a2b593d096) and click on Share -> Publish.

## 🎯 Key Features Implemented

✅ Full authentication system with protected routes  
✅ Database integration with Supabase  
✅ Mood tracking with weekly visualization  
✅ Streak counter for user engagement  
✅ Dark mode with persistent preferences  
✅ Affirmation library with categories  
✅ Meditation timer with progress tracking  
✅ Responsive mobile-first design  
✅ Beautiful pastel gradients and animations  

## 💡 Usage Tips

### For Developers
- All colors use HSL and semantic tokens from `index.css`
- Components are small and focused
- Database queries use React Query for caching
- Authentication is handled via Context API
- Theme switching uses localStorage for persistence

### For Users
- Set a daily reminder to log your mood
- Explore different affirmation categories
- Use meditation during stressful moments
- Track your progress over time
- Enable dark mode for evening use

## 🔒 Security

- Row Level Security (RLS) on all tables
- Secure authentication with Supabase
- Email auto-confirmation enabled
- Protected API routes
- User data isolated by auth.uid()

## 📱 Pages

1. **Splash** - Animated welcome screen
2. **Onboarding** - 3-slide introduction
3. **Auth** - Login/Signup forms
4. **Home** - Daily dashboard with affirmations
5. **Meditation** - Timer with visual progress
6. **Affirmations** - Browse by category
7. **Profile** - Mood tracking, settings, achievements
8. **Subscription** - Premium features (coming soon)

## 🎨 Design Tokens

The app uses a comprehensive design system defined in `src/index.css`:
- Custom HSL color palette
- Gradient definitions
- Animation keyframes
- Poppins font family
- Dark mode variants

---

**Blissy** - Find your calm, one breath at a time 🌿
