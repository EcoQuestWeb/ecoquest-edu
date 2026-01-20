import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Recycle, Puzzle, Type, Brain, Globe, Sparkles, TreePine, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/dashboard/Header';
import { UserStats } from '@/components/dashboard/UserStats';
import { PageTransition } from '@/components/animations';
import { RunnerBackground, RunningAvatar, GameCheckpoint } from '@/components/runner';
import { GlobalStats, GameMascot } from '@/components/progression';

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
      <RunnerBackground>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <RunningAvatar size="lg" isRunning={true} />
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-primary font-display text-xl"
          >
            Loading your adventure...
          </motion.div>
        </div>
      </RunnerBackground>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const showAdvancedQuiz = profile.class >= 10;

  type GameColor = 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'pink' | 'yellow';
  
  const games: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    color: GameColor;
  }> = [
    {
      title: "Waste Sorting Game",
      description: "Learn to sort waste into the correct recycling bins. Save the planet one item at a time!",
      icon: <Recycle className="w-6 h-6 sm:w-7 sm:h-7 text-eco-leaf" />,
      path: "/games/waste-sorting",
      color: "green",
    },
    {
      title: "Eco Puzzle",
      description: "Solve beautiful nature-themed puzzles while discovering amazing eco-facts!",
      icon: <Puzzle className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />,
      path: "/games/eco-puzzle",
      color: "blue",
    },
    {
      title: "Eco Wordle",
      description: "Guess the hidden eco-word in 6 tries! Expand your environmental vocabulary.",
      icon: <Type className="w-6 h-6 sm:w-7 sm:h-7 text-eco-earth" />,
      path: "/games/eco-wordle",
      color: "orange",
    },
    {
      title: "Carbon Footprint Calculator 🌍",
      description: "Answer simple questions to discover your environmental impact and earn points!",
      icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-teal-500" />,
      path: "/games/carbon-footprint",
      color: "teal",
    },
    {
      title: "Eco Match Game 🧠",
      description: "Match items with their correct environmental actions. Test your eco-knowledge!",
      icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500" />,
      path: "/games/eco-match",
      color: "pink",
    },
    {
      title: "Save the Forest 🌳",
      description: "Make decisions to protect Greenwood Forest. Your choices shape the ecosystem!",
      icon: <TreePine className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />,
      path: "/games/save-the-forest",
      color: "green",
    },
    {
      title: "Rapid Eco Quiz ⚡",
      description: "Quick-fire environmental questions with a timer. Build streaks for bonus points!",
      icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />,
      path: "/games/rapid-eco-quiz",
      color: "yellow",
    },
  ];

  if (showAdvancedQuiz) {
    games.push({
      title: "Environmental Quiz Challenge",
      description: "Advanced environmental science questions for senior students. Test your knowledge!",
      icon: <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />,
      path: "/games/environmental-quiz",
      color: "purple",
    });
  }

  return (
    <RunnerBackground>
      <Header />

      <PageTransition>
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-4xl pb-24">
          {/* Mascot with greeting */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-2"
          >
            <GameMascot mood="running" size="md" showSpeech speechText="Let's save the planet! 🌍" />
            <div className="flex-1">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-muted-foreground"
              >
                Keep running, eco-warrior!
              </motion.p>
            </div>
          </motion.div>

          {/* User Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <UserStats />
          </motion.div>

          {/* Global Stats with Plant Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlobalStats />
          </motion.div>

          {/* Games Section - Runner Track Style */}
          <section className="relative">
            {/* Track line */}
            <motion.div
              className="absolute left-4 sm:left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-eco-leaf via-eco-sky to-eco-sun opacity-30"
              initial={{ scaleY: 0, originY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />

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
                🏁
              </motion.span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-foreground">
                Eco Checkpoints
              </h2>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({games.length} challenges ahead)
              </span>
            </motion.div>

            <div className="space-y-3 sm:space-y-4">
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
              <span>🏃</span>
              <span>Complete levels to grow your plants into mighty trees!</span>
              <span>🌳</span>
            </motion.p>
          </motion.div>
        </main>
      </PageTransition>
    </RunnerBackground>
  );
};

export default Index;
