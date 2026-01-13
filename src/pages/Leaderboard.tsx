import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'bg-primary/10 border-primary/30';
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-card border-border/50';
    }
  };

  // Find current user's rank
  const currentUserRank = leaderboard.findIndex(u => u.id === user.id) + 1;

  return (
    <div className="min-h-screen gradient-sky leaf-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="eco-card animate-fade-in">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-eco-sun/30 flex items-center justify-center mb-3">
              <Trophy className="w-8 h-8 text-eco-earth" />
            </div>
            <CardTitle className="font-display text-2xl text-foreground">Global Leaderboard</CardTitle>
            <p className="text-muted-foreground text-sm">Top eco warriors ranked by points</p>
            
            {currentUserRank > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <span className="text-sm text-muted-foreground">Your Rank:</span>
                <span className="font-bold text-primary">#{currentUserRank}</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-2">
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No players yet. Be the first!</p>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.id === user.id;

                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 animate-fade-in ${getRankBg(rank, isCurrentUser)} ${isCurrentUser ? 'ring-2 ring-primary/50' : ''}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                      {getRankIcon(rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                          {entry.name}
                          {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        Class {entry.class} • {entry.institution}
                      </p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="font-bold text-eco-earth">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">pts</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;