import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recycle, Brain, Globe, Zap, Waves, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { UserStats } from '@/components/dashboard/UserStats';
import { PageTransition } from '@/components/animations';
import { FloatingEcoIcons } from '@/components/runner/RunnerBackground';
import { GameCheckpoint } from '@/components/runner';

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-eco-sky/20 via-background to-eco-leaf/10">
        <motion.div 
          className="text-5xl"
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { duration: 2, repeat: Infinity, ease: 'linear' }, scale: { duration: 1, repeat: Infinity } }}
        >
          🌱
        </motion.div>
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-primary font-display text-xl"
        >
          Loading your adventure...
        </motion.div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const showAdvancedQuiz = profile.class >= 10;

  type GameColor = 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'yellow';
  
  // STRICT: Only 6 games - no duplicates
  const games: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    color: GameColor;
  }> = [
    {
      title: "Waste Sorting ♻️",
      description: "Sort items into the correct recycling bins. 5 levels to master!",
      icon: <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-eco-leaf" />,
      path: "/games/waste-sorting",
      color: "green",
    },
    {
      title: "Ocean Cleanup 🌊",
      description: "Clean the ocean! Collect trash while avoiding fish.",
      icon: <Waves className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" />,
      path: "/games/ocean-cleanup",
      color: "blue",
    },
    {
      title: "Trash Shooter 🎯",
      description: "Match 3+ eco items to pop them! Aim and shoot!",
      icon: <Target className="w-6 h-6 sm:w-7 sm:h-7 text-orange-500" />,
      path: "/games/trash-shooter",
      color: "orange",
    },
    {
      title: "Carbon Footprint 🌍",
      description: "Discover your environmental impact through 5 quiz levels!",
      icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500" />,
      path: "/games/carbon-footprint",
      color: "teal",
    },
    {
      title: "Rapid Eco Quiz ⚡",
      description: "Quick-fire environmental questions with a timer!",
      icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />,
      path: "/games/rapid-eco-quiz",
      color: "yellow",
    },
  ];

  // Only show Environmental Quiz for class 10+
  if (showAdvancedQuiz) {
    games.push({
      title: "Environmental Quiz 🧠",
      description: "Advanced environmental science questions for senior students!",
      icon: <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />,
      path: "/games/environmental-quiz",
      color: "purple",
    });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-eco-sky/20 via-background to-eco-leaf/10">
      {/* Floating Eco Icons */}
      <FloatingEcoIcons />
      
      <div className="relative z-10">
        <Header />

        <PageTransition>
          <main className="container mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-8 space-y-4 sm:space-y-6 max-w-4xl">
            {/* User Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <UserStats />
            </motion.div>

            {/* Games Section */}
            <section className="relative">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-2 mb-4"
              >
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎮
                </motion.span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-foreground">
                  Eco Games
                </h2>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  ({games.length} games available)
                </span>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {games.map((game, index) => (
                  <GameCheckpoint
                    key={game.path}
                    {...game}
                    index={index}
                  />
                ))}
              </div>
            </section>

            {/* Motivational Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="text-center py-4 sm:py-6"
            >
              <motion.p 
                className="text-muted-foreground text-xs sm:text-sm flex items-center justify-center gap-2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span>🌱</span>
                <span>Play games and grow your environmental knowledge!</span>
                <span>🌳</span>
              </motion.p>
            </motion.div>
          </main>
        </PageTransition>
      </div>
    </div>
  );
};

export default Index;
