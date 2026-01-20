import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition, PointsCounter } from '@/components/animations';

interface LeaderboardUser {
  id: string;
  name: string;
  class: number;
  institution: string;
  points: number;
}

const Leaderboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, class, institution, points')
        .order('points', { ascending: false })
        .limit(100);

      if (!error && data) {
        setLeaderboard(data);
      }
      setLoading(false);
    }

    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  if (authLoading || loading) {
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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />;
      default:
        return <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold text-muted-foreground text-sm">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/30';
    switch (rank) {
      case 1:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 2:
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
      case 3:
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700';
      default:
        return 'bg-card border-border/50';
    }
  };

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(u => u.id === user.id) + 1;

  return (
    <div className="min-h-screen gradient-sky leaf-pattern overflow-x-hidden">
      <Header />

      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
          <Card className="eco-card">
            <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
              <motion.div 
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-eco-sun/30 flex items-center justify-center mb-3"
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-eco-earth" />
              </motion.div>
              <CardTitle className="font-display text-xl sm:text-2xl text-foreground">Global Leaderboard</CardTitle>
              <p className="text-muted-foreground text-xs sm:text-sm">Top eco warriors ranked by points</p>
              
              {currentUserRank > 0 && (
                <motion.div 
                  className="mt-3 sm:mt-4 inline-flex items-center gap-2 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.3 }}
                >
                  <span className="text-xs sm:text-sm text-muted-foreground">Your Rank:</span>
                  <span className="font-bold text-primary">#{currentUserRank}</span>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-2 px-3 sm:px-6">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No players yet. Be the first!</p>
              ) : (
                leaderboard.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentUser = entry.id === user.id;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300 ${getRankBg(rank, isCurrentUser)} ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}`}
                    >
                      {/* Rank */}
                      <motion.div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-background flex items-center justify-center shadow-sm"
                        whileHover={{ rotate: rank <= 3 ? [0, -10, 10, 0] : 0 }}
                      >
                        {getRankIcon(rank)}
                      </motion.div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <p className={`font-medium truncate text-sm sm:text-base ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                            {entry.name}
                            {isCurrentUser && <span className="text-[10px] sm:text-xs ml-1">(You)</span>}
                          </p>
                        </div>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          Class {entry.class} • {entry.institution}
                        </p>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <p className="font-bold text-eco-earth text-sm sm:text-base">
                          <PointsCounter value={entry.points} duration={0.5} />
                        </p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">pts</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </main>
      </PageTransition>
    </div>
  );
};

export default Leaderboard;
