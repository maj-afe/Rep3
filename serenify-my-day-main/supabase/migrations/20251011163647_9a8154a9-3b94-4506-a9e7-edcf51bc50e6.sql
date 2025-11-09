-- Create affirmations table
CREATE TABLE public.affirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_affirmations table for custom affirmations
CREATE TABLE public.user_affirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mood_entries table
CREATE TABLE public.mood_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_value INTEGER NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meditation_sessions table
CREATE TABLE public.meditation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meditations table
CREATE TABLE public.meditations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  audio_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meditations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affirmations (public read)
CREATE POLICY "Affirmations are viewable by everyone" 
ON public.affirmations FOR SELECT USING (true);

-- RLS Policies for user_affirmations
CREATE POLICY "Users can view their own affirmations" 
ON public.user_affirmations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affirmations" 
ON public.user_affirmations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affirmations" 
ON public.user_affirmations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own affirmations" 
ON public.user_affirmations FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for mood_entries
CREATE POLICY "Users can view their own mood entries" 
ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mood entries" 
ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood entries" 
ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mood entries" 
ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meditation_sessions
CREATE POLICY "Users can view their own meditation sessions" 
ON public.meditation_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meditation sessions" 
ON public.meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meditations (public read)
CREATE POLICY "Meditations are viewable by everyone" 
ON public.meditations FOR SELECT USING (true);

-- Insert sample affirmations
INSERT INTO public.affirmations (text, category) VALUES
  ('I am enough, just as I am.', 'Confidence'),
  ('I choose peace over worry.', 'Peace'),
  ('My breath brings me back to center.', 'Focus'),
  ('I am worthy of love and happiness.', 'Confidence'),
  ('Today, I embrace calm and clarity.', 'Peace'),
  ('I release what I cannot control.', 'Peace'),
  ('My mind is peaceful, my heart is open.', 'Peace'),
  ('I trust in my ability to overcome challenges.', 'Confidence'),
  ('Every day, I grow stronger and wiser.', 'Confidence'),
  ('I am present in this moment.', 'Focus'),
  ('I deserve rest and relaxation.', 'Peace'),
  ('I am grateful for this new day.', 'Gratitude');

-- Insert sample meditations
INSERT INTO public.meditations (title, duration_seconds, description) VALUES
  ('Morning Calm', 300, 'Start your day with peaceful clarity'),
  ('Mind Relax Session', 600, 'Deep relaxation for mental clarity'),
  ('Evening Wind Down', 480, 'Release the day and find peace'),
  ('Breath Focus', 420, 'Center yourself through mindful breathing');