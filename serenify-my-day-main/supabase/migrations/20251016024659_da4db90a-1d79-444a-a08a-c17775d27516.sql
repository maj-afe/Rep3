-- Create achievements table
CREATE TABLE public.user_achievements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  achievement_id text NOT NULL,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add reminder_types column to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN reminder_types text[] DEFAULT ARRAY['meditation', 'mood', 'affirmations']::text[];