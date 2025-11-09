-- Add meditation_id reference to meditation_sessions
ALTER TABLE meditation_sessions 
ADD COLUMN meditation_id UUID REFERENCES meditations(id);

-- User preferences table for future phases
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  notification_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME,
  preferred_meditation_time TEXT,
  primary_goal TEXT DEFAULT 'Peace',
  theme_preset TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Add sample meditation audio URLs
UPDATE meditations 
SET audio_url = CASE 
  WHEN title = 'Morning Mindfulness' THEN 'https://www.soundhealing.com/music/meditation/morning-meditation.mp3'
  WHEN title = 'Deep Relaxation' THEN 'https://www.soundhealing.com/music/meditation/deep-relaxation.mp3'
  WHEN title = 'Stress Relief' THEN 'https://www.soundhealing.com/music/meditation/stress-relief.mp3'
  WHEN title = 'Sleep Meditation' THEN 'https://www.soundhealing.com/music/meditation/sleep-meditation.mp3'
  ELSE 'https://www.soundhealing.com/music/meditation/default.mp3'
END
WHERE audio_url IS NULL;