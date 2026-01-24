import { motion } from 'framer-motion';
import { ArrowLeft, Play, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LevelSelector } from './LevelSelector';
import { PlantGrowth } from './PlantGrowth';
import { GameDashboard } from './GameDashboard';
import { useLevelProgress, GameName } from '@/contexts/LevelProgressContext';

interface GameEntryScreenProps {
  gameName: GameName;
  gameTitle: string;
  gameDescription: string;
  gameIcon: React.ReactNode;
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  onStartGame: () => void;
  totalLevels?: number;
}

export function GameEntryScreen({
  gameName,
  gameTitle,
  gameDescription,
  gameIcon,
  selectedLevel,
  onSelectLevel,
  onStartGame,
  totalLevels = 5,
}: GameEntryScreenProps) {
  const navigate = useNavigate();
  const { getPlantStage, getGameProgress, isLevelUnlocked } = useLevelProgress();
  const plantStage = getPlantStage(gameName);
  const progress = getGameProgress(gameName);

  const plantStageLabels = [
    { stage: 'Seed', emoji: '🌰', description: 'Complete Level 1 to sprout!' },
    { stage: 'Sprout', emoji: '🌱', description: 'Your plant is growing!' },
    { stage: 'Small Plant', emoji: '🌿', description: 'Branches are forming!' },
    { stage: 'Flowering', emoji: '🪴', description: 'Almost a tree!' },
    { stage: 'Full Tree', emoji: '🌳', description: 'You grew a tree! 🎉' },
  ];

  const currentPlantInfo = plantStageLabels[plantStage];

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-sky/20 via-background to-eco-leaf/10">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                {gameIcon}
                <div>
                  <h1 className="font-display font-bold text-lg sm:text-xl text-foreground line-clamp-1">
                    {gameTitle}
                  </h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {gameDescription}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 sm:pt-28 pb-8">
        <div className="max-w-4xl mx-auto">
          {/* Mobile: Stack layout, Desktop: Two columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Side - Level Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="order-2 lg:order-1"
            >
              <div className="eco-card">
                <LevelSelector
                  gameName={gameName}
                  totalLevels={totalLevels}
                  onSelectLevel={onSelectLevel}
                  currentLevel={selectedLevel}
                />

                {/* Start Button */}
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    onClick={onStartGame}
                    disabled={!isLevelUnlocked(gameName, selectedLevel)}
                    className="w-full py-6 text-lg font-bold gradient-nature text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    Play Level {selectedLevel}
                  </Button>
                </motion.div>

                {/* Level Info */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>🔓 Complete each level to unlock the next</p>
                  <p className="mt-1">🌱 Grow your plant from seed to tree!</p>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Plant Growth Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="eco-card text-center">
                <h3 className="font-display font-bold text-lg text-foreground mb-4">
                  🌱 Your Progress
                </h3>

                {/* Big Plant Visual */}
                <motion.div
                  className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full bg-gradient-to-br from-eco-leaf/20 to-eco-forest/10 flex items-center justify-center mb-6"
                  animate={plantStage >= 4 ? {
                    boxShadow: [
                      '0 0 0 0 rgba(34, 197, 94, 0)',
                      '0 0 40px 20px rgba(34, 197, 94, 0.3)',
                      '0 0 0 0 rgba(34, 197, 94, 0)',
                    ],
                  } : undefined}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Glow effect */}
                  {plantStage > 0 && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-t from-eco-leaf/30 to-transparent"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Plant Emoji */}
                  <motion.span
                    className="text-7xl sm:text-8xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: plantStage >= 4 ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {currentPlantInfo.emoji}
                  </motion.span>

                  {/* Sparkles for tree */}
                  {plantStage >= 4 && (
                    <>
                      <motion.span
                        className="absolute top-4 right-8 text-xl"
                        animate={{ opacity: [0, 1, 0], y: [-5, -20] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ✨
                      </motion.span>
                      <motion.span
                        className="absolute top-8 left-8 text-xl"
                        animate={{ opacity: [0, 1, 0], y: [-5, -20] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      >
                        ✨
                      </motion.span>
                      <motion.span
                        className="absolute bottom-12 right-10 text-lg"
                        animate={{ opacity: [0, 1, 0], y: [-5, -15] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                      >
                        ⭐
                      </motion.span>
                    </>
                  )}
                </motion.div>

                {/* Stage Label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="font-display font-bold text-xl text-foreground mb-1">
                    {currentPlantInfo.stage}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentPlantInfo.description}
                  </p>
                </motion.div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-2 mt-6">
                  {plantStageLabels.map((info, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        idx <= plantStage
                          ? 'bg-eco-leaf/20'
                          : 'bg-muted/50 opacity-50'
                      }`}
                      whileHover={{ scale: 1.1 }}
                      title={info.stage}
                    >
                      {info.emoji}
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-muted/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">
                      {progress.levelsCompleted.length}/{totalLevels}
                    </p>
                    <p className="text-xs text-muted-foreground">Levels Done</p>
                  </div>
                  <div className="bg-eco-sun/20 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-eco-earth">
                      {progress.totalPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
