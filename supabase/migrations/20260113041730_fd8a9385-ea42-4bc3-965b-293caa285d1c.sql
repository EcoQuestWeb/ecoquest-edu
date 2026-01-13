-- Add RLS policy to allow all authenticated users to view leaderboard data (name, class, institution, points only)
CREATE POLICY "Users can view leaderboard data"
ON public.users
FOR SELECT
TO authenticated
USING (true);