import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Gamepad2, TrendingUp, Recycle, Puzzle, Type, Brain, Globe, Sparkles, TreePine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress, GameName } from '@/hooks/useGameProgress';
import { Header } from '@/components/dashboard/Header';

interface GameProgressData {
  id: string;
  user_id: string;
  game_name: string;
  times_played: number;
  total_points: number;
  updated_at: string;
}

const GAME_INFO: Record<GameName, { name: string; icon: React.ReactNode; color: string }> = {
  'waste-sorting': { name: 'Waste Sorting', icon: <Recycle className="w-5 h-5" />, color: 'text-eco-leaf' },
  'eco-puzzle': { name: 'Eco Puzzle', icon: <Puzzle className="w-5 h-5" />, color: 'text-blue-500' },
  'eco-wordle': { name: 'Eco Wordle', icon: <Type className="w-5 h-5" />, color: 'text-eco-earth' },
  'environmental-quiz': { name: 'Environmental Quiz', icon: <Brain className="w-5 h-5" />, color: 'text-purple-500' },
  'carbon-footprint': { name: 'Carbon Footprint', icon: <Globe className="w-5 h-5" />, color: 'text-teal-500' },
  'eco-match': { name: 'Eco Match', icon: <Sparkles className="w-5 h-5" />, color: 'text-pink-500' },
  'save-the-forest': { name: 'Save the Forest', icon: <TreePine className="w-5 h-5" />, color: 'text-green-600' },
  'rapid-eco-quiz': { name: 'Rapid Eco Quiz', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-500' },
};

export default function Progress() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { getAllProgress } = useGameProgress();
  
  const [progress, setProgress] = useState<GameProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (user) {
        const data = await getAllProgress();
        setProgress(data);
        setIsLoading(false);
      }
    };
    
    if (!loading) {
      fetchProgress();
    }
  }, [user, loading, getAllProgress]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const totalGamesPlayed = progress.reduce((sum, p) => sum + p.times_played, 0);

  return (
    <div className="min-h-screen gradient-sky leaf-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Overview Stats */}
        <div className="eco-card animate-fade-in-up">
          <h2 className="font-display font-bold text-xl text-foreground mb-4">
            📊 Your Progress
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Points */}
            <div className="bg-gradient-to-br from-eco-sun/20 to-eco-sun/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-eco-sun/30 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-eco-earth" />
                </div>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
              <p className="font-bold text-3xl text-foreground">{profile.points}</p>
            </div>

            {/* Total Games */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Games Played</p>
              </div>
              <p className="font-bold text-3xl text-foreground">{totalGamesPlayed}</p>
            </div>
          </div>
        </div>

        {/* Game-wise Stats */}
        <div className="eco-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">
              Game Statistics
            </h2>
          </div>

          {progress.length === 0 ? (
            <div className="text-center py-8">
              <Gamepad2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No games played yet!</p>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-4 gradient-nature text-primary-foreground"
              >
                Start Playing 🎮
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.map((game) => {
                const info = GAME_INFO[game.game_name as GameName];
                if (!info) return null;

                return (
                  <div 
                    key={game.id}
                    className="bg-muted/50 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-card flex items-center justify-center ${info.color}`}>
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{info.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last played: {new Date(game.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{game.total_points} pts</p>
                      <p className="text-sm text-muted-foreground">{game.times_played} plays</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Encouragement */}
        <div className="text-center py-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-muted-foreground text-sm">
            🌱 Keep playing to earn more points and save the planet!
          </p>
        </div>
      </main>
    </div>
  );
}
