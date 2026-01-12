import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Puzzle, Type, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { UserStats } from '@/components/dashboard/UserStats';
import { GameCard } from '@/components/dashboard/GameCard';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const showAdvancedQuiz = profile.class >= 10;

  return (
    <div className="min-h-screen gradient-sky leaf-pattern">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* User Stats */}
        <UserStats />

        {/* Games Section */}
        <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-bold text-xl text-foreground">🎮 Eco Games</h2>
            <span className="text-sm text-muted-foreground">
              ({showAdvancedQuiz ? 4 : 3} games available)
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Waste Sorting Game */}
            <GameCard
              title="Waste Sorting Game"
              description="Learn to sort waste into the correct recycling bins. Save the planet one item at a time!"
              icon={<Recycle className="w-7 h-7 text-eco-leaf" />}
              path="/games/waste-sorting"
              color="green"
            />

            {/* Eco Puzzle */}
            <GameCard
              title="Eco Puzzle"
              description="Solve beautiful nature-themed puzzles while discovering amazing eco-facts!"
              icon={<Puzzle className="w-7 h-7 text-blue-500" />}
              path="/games/eco-puzzle"
              color="blue"
            />

            {/* Eco Wordle */}
            <GameCard
              title="Eco Wordle"
              description="Guess the hidden eco-word in 6 tries! Expand your environmental vocabulary."
              icon={<Type className="w-7 h-7 text-eco-earth" />}
              path="/games/eco-wordle"
              color="orange"
            />

            {/* Environmental Quiz - Only for Class 10+ */}
            {showAdvancedQuiz && (
              <GameCard
                title="Environmental Quiz Challenge"
                description="Advanced environmental science questions for senior students. Test your knowledge!"
                icon={<Brain className="w-7 h-7 text-purple-500" />}
                path="/games/environmental-quiz"
                color="purple"
              />
            )}
          </div>
        </section>

        {/* Motivational Footer */}
        <div className="text-center py-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-muted-foreground text-sm">
            🌍 Every game you play helps you learn how to protect our planet!
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
