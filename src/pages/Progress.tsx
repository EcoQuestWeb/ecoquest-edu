import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Gamepad2, TrendingUp, Recycle, Puzzle, Type, Brain, Globe, Sparkles, TreePine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress, GameName } from '@/hooks/useGameProgress';
import { Header } from '@/components/dashboard/Header';
import { PageTransition, PointsCounter, StaggerContainer, StaggerItem } from '@/components/animations';

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
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary font-display text-xl"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const totalGamesPlayed = progress.reduce((sum, p) => sum + p.times_played, 0);

  return (
    <div className="min-h-screen gradient-sky leaf-pattern overflow-x-hidden">
      <Header />

      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 h-9 text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </motion.div>

          {/* Overview Stats */}
          <motion.div 
            className="eco-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display font-bold text-lg sm:text-xl text-foreground mb-3 sm:mb-4">
              📊 Your Progress
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Total Points */}
              <motion.div 
                className="bg-gradient-to-br from-eco-sun/20 to-eco-sun/5 rounded-lg sm:rounded-xl p-3 sm:p-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <motion.div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-eco-sun/30 flex items-center justify-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-eco-earth" />
                  </motion.div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Points</p>
                </div>
                <p className="font-bold text-2xl sm:text-3xl text-foreground">
                  <PointsCounter value={profile.points} />
                </p>
              </motion.div>

              {/* Total Games */}
              <motion.div 
                className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg sm:rounded-xl p-3 sm:p-5"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Games Played</p>
                </div>
                <p className="font-bold text-2xl sm:text-3xl text-foreground">
                  <PointsCounter value={totalGamesPlayed} />
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Game-wise Stats */}
          <motion.div 
            className="eco-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground">
                Game Statistics
              </h2>
            </div>

            {progress.length === 0 ? (
              <motion.div 
                className="text-center py-6 sm:py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-3" />
                </motion.div>
                <p className="text-muted-foreground text-sm">No games played yet!</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    onClick={() => navigate('/')} 
                    className="mt-4 gradient-nature text-primary-foreground"
                  >
                    Start Playing 🎮
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <StaggerContainer className="space-y-2 sm:space-y-3" staggerDelay={0.05}>
                {progress.map((game) => {
                  const info = GAME_INFO[game.game_name as GameName];
                  if (!info) return null;

                  return (
                    <StaggerItem key={game.id}>
                      <motion.div 
                        className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
                        whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted))' }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <motion.div 
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-card flex items-center justify-center ${info.color}`}
                          whileHover={{ rotate: [0, -10, 10, 0] }}
                        >
                          {info.icon}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground text-sm sm:text-base">{info.name}</h3>
                          <p className="text-[10px] sm:text-sm text-muted-foreground">
                            Last played: {new Date(game.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-foreground text-sm sm:text-base">{game.total_points} pts</p>
                          <p className="text-[10px] sm:text-sm text-muted-foreground">{game.times_played} plays</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </motion.div>

          {/* Encouragement */}
          <motion.div 
            className="text-center py-3 sm:py-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-muted-foreground text-xs sm:text-sm">
              🌱 Keep playing to earn more points and save the planet!
            </p>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
}
