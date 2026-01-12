-- Create game_progress table
CREATE TABLE public.game_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_name TEXT NOT NULL,
  times_played INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_name)
);

-- Enable Row Level Security
ALTER TABLE public.game_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON public.game_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
ON public.game_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON public.game_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_game_progress_user_id ON public.game_progress(user_id);
CREATE INDEX idx_game_progress_game_name ON public.game_progress(game_name);

-- Create function to update game progress and user points atomically
CREATE OR REPLACE FUNCTION public.complete_game(
  p_user_id UUID,
  p_game_name TEXT,
  p_points_earned INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_total_points INTEGER;
  v_times_played INTEGER;
  v_game_total_points INTEGER;
BEGIN
  -- Update user's total points
  UPDATE public.users
  SET points = points + p_points_earned
  WHERE id = p_user_id
  RETURNING points INTO v_new_total_points;

  -- Upsert game progress
  INSERT INTO public.game_progress (user_id, game_name, times_played, total_points, updated_at)
  VALUES (p_user_id, p_game_name, 1, p_points_earned, now())
  ON CONFLICT (user_id, game_name)
  DO UPDATE SET
    times_played = game_progress.times_played + 1,
    total_points = game_progress.total_points + p_points_earned,
    updated_at = now()
  RETURNING times_played, total_points INTO v_times_played, v_game_total_points;

  RETURN json_build_object(
    'user_total_points', v_new_total_points,
    'game_times_played', v_times_played,
    'game_total_points', v_game_total_points
  );
END;
$$;