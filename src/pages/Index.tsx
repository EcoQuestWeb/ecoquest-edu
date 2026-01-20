import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recycle, Puzzle, Type, Brain, Globe, Sparkles, TreePine, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { UserStats } from '@/components/dashboard/UserStats';
import { GameCard } from '@/components/dashboard/GameCard';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/animations';

const Index = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Refresh profile on navigation to ensure points are up-to-date
  useEffect(() => {
    if (user && !loading) {
      refreshProfile();
    }
  }, [user, loading, refreshProfile]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
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

  const showAdvancedQuiz = profile.class >= 10;

  return (
    <div className="min-h-screen gradient-sky leaf-pattern overflow-x-hidden">
      <Header />

      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserStats />
          </motion.div>

          {/* Games Section */}
          <section>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-2 mb-4"
            >
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground">🎮 Eco Games</h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({showAdvancedQuiz ? 8 : 7} games available)
              </span>
            </motion.div>

            <StaggerContainer 
              className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              staggerDelay={0.08}
            >
              {/* Waste Sorting Game */}
              <StaggerItem>
                <GameCard
                  title="Waste Sorting Game"
                  description="Learn to sort waste into the correct recycling bins. Save the planet one item at a time!"
                  icon={<Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-eco-leaf" />}
                  path="/games/waste-sorting"
                  color="green"
                />
              </StaggerItem>

              {/* Eco Puzzle */}
              <StaggerItem>
                <GameCard
                  title="Eco Puzzle"
                  description="Solve beautiful nature-themed puzzles while discovering amazing eco-facts!"
                  icon={<Puzzle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />}
                  path="/games/eco-puzzle"
                  color="blue"
                />
              </StaggerItem>

              {/* Eco Wordle */}
              <StaggerItem>
                <GameCard
                  title="Eco Wordle"
                  description="Guess the hidden eco-word in 6 tries! Expand your environmental vocabulary."
                  icon={<Type className="w-6 h-6 sm:w-7 sm:h-7 text-eco-earth" />}
                  path="/games/eco-wordle"
                  color="orange"
                />
              </StaggerItem>

              {/* Carbon Footprint Calculator */}
              <StaggerItem>
                <GameCard
                  title="Carbon Footprint Calculator 🌍"
                  description="Answer simple questions to discover your environmental impact and earn points!"
                  icon={<Globe className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500" />}
                  path="/games/carbon-footprint"
                  color="teal"
                />
              </StaggerItem>

              {/* Eco Match Game */}
              <StaggerItem>
                <GameCard
                  title="Eco Match Game 🧠"
                  description="Match items with their correct environmental actions. Test your eco-knowledge!"
                  icon={<Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500" />}
                  path="/games/eco-match"
                  color="pink"
                />
              </StaggerItem>

              {/* Save the Forest */}
              <StaggerItem>
                <GameCard
                  title="Save the Forest 🌳"
                  description="Make decisions to protect Greenwood Forest. Your choices shape the ecosystem!"
                  icon={<TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />}
                  path="/games/save-the-forest"
                  color="green"
                />
              </StaggerItem>

              {/* Rapid Eco Quiz */}
              <StaggerItem>
                <GameCard
                  title="Rapid Eco Quiz ⚡"
                  description="Quick-fire environmental questions with a timer. Build streaks for bonus points!"
                  icon={<Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />}
                  path="/games/rapid-eco-quiz"
                  color="yellow"
                />
              </StaggerItem>

              {/* Environmental Quiz - Only for Class 10+ */}
              {showAdvancedQuiz && (
                <StaggerItem>
                  <GameCard
                    title="Environmental Quiz Challenge"
                    description="Advanced environmental science questions for senior students. Test your knowledge!"
                    icon={<Brain className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />}
                    path="/games/environmental-quiz"
                    color="purple"
                  />
                </StaggerItem>
              )}
            </StaggerContainer>
          </section>

          {/* Motivational Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center py-4 sm:py-6"
          >
            <p className="text-muted-foreground text-xs sm:text-sm">
              🌍 Every game you play helps you learn how to protect our planet!
            </p>
          </motion.div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Index;
