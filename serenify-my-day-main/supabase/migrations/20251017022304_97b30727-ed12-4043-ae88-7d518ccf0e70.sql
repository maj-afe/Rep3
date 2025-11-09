-- Add ambient sound preferences to user_preferences
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS ambient_sounds jsonb DEFAULT '{"enabled": false, "mix": []}'::jsonb;

-- Create shared_reflections table for community features
CREATE TABLE IF NOT EXISTS public.shared_reflections (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  mood_value integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  likes_count integer DEFAULT 0,
  is_moderated boolean DEFAULT false,
  moderation_flag text
);

-- Enable RLS
ALTER TABLE public.shared_reflections ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_reflections
CREATE POLICY "Shared reflections are viewable by everyone" 
ON public.shared_reflections 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create shared reflections" 
ON public.shared_reflections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections" 
ON public.shared_reflections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.reflection_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reflection_id uuid NOT NULL REFERENCES public.shared_reflections(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, reflection_id)
);

-- Enable RLS
ALTER TABLE public.reflection_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for reflection_likes
CREATE POLICY "Users can view all likes" 
ON public.reflection_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.reflection_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.reflection_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update likes count
CREATE OR REPLACE FUNCTION public.update_reflection_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.shared_reflections 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.reflection_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.shared_reflections 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.reflection_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for likes count
CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON public.reflection_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_reflection_likes_count();