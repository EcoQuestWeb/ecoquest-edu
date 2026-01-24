import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type GameName = 'waste-sorting' | 'eco-puzzle' | 'eco-wordle' | 'environmental-quiz' | 'carbon-footprint' | 'eco-match' | 'save-the-forest' | 'rapid-eco-quiz' | 'ocean-cleanup' | 'trash-shooter';

interface GameResult {
  userTotalPoints: number;
  gameTimesPlayed: number;
  gameTotalPoints: number;
}

export function useGameProgress() {
  const { user, refreshProfile } = useAuth();

  const completeGame = async (gameName: GameName, pointsEarned: number): Promise<GameResult | null> => {
    if (!user) {
      toast.error('You must be logged in to save progress');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('complete_game', {
        p_user_id: user.id,
        p_game_name: gameName,
        p_points_earned: pointsEarned,
      });

      if (error) {
        console.error('Error completing game:', error);
        toast.error('Failed to save game progress');
        return null;
      }

      // Refresh the profile to get updated points
      await refreshProfile();

      const responseData = data as { user_total_points: number; game_times_played: number; game_total_points: number };
      const result: GameResult = {
        userTotalPoints: responseData.user_total_points,
        gameTimesPlayed: responseData.game_times_played,
        gameTotalPoints: responseData.game_total_points,
      };

      toast.success(`+${pointsEarned} points earned! 🎉`);
      return result;
    } catch (err) {
      console.error('Error in completeGame:', err);
      toast.error('Something went wrong');
      return null;
    }
  };

  const getGameProgress = async (gameName: GameName) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_name', gameName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching game progress:', error);
      return null;
    }

    return data;
  };

  const getAllProgress = async () => {
    if (!user) return [];

    const { data, error } = await supabase
      .from('game_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching all progress:', error);
      return [];
    }

    return data || [];
  };

  return {
    completeGame,
    getGameProgress,
    getAllProgress,
  };
}
