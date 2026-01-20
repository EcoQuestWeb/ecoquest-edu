import { motion } from 'framer-motion';
import { Lock, Check, Star } from 'lucide-react';
import { useLevelProgress, GameName } from '@/contexts/LevelProgressContext';

interface LevelSelectorProps {
  gameName: GameName;
  totalLevels?: number;
  onSelectLevel: (level: number) => void;
  currentLevel?: number;
}

const levelDifficulty = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
const levelColors = [
  'from-green-400 to-green-600',
  'from-blue-400 to-blue-600',
  'from-orange-400 to-orange-600',
  'from-purple-400 to-purple-600',
  'from-red-400 to-red-600',
];

export function LevelSelector({ 
  gameName, 
  totalLevels = 5, 
  onSelectLevel,
  currentLevel 
}: LevelSelectorProps) {
  const { isLevelUnlocked, getGameProgress } = useLevelProgress();
  const progress = getGameProgress(gameName);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-foreground">Select Level</h3>
        <span className="text-sm text-muted-foreground">
          {progress.levelsCompleted.length}/{totalLevels} completed
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: totalLevels }).map((_, idx) => {
          const level = idx + 1;
          const isUnlocked = isLevelUnlocked(gameName, level);
          const isCompleted = progress.levelsCompleted.includes(level);
          const isActive = currentLevel === level;

          return (
            <motion.button
              key={level}
              onClick={() => isUnlocked && onSelectLevel(level)}
              disabled={!isUnlocked}
              className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all duration-300 touch-manipulation
                ${isUnlocked 
                  ? isActive
                    ? `bg-gradient-to-br ${levelColors[idx % levelColors.length]} text-white shadow-lg scale-105`
                    : isCompleted
                      ? 'bg-gradient-to-br from-eco-leaf to-eco-forest text-white'
                      : 'bg-card hover:bg-muted border border-border'
                  : 'bg-muted/50 cursor-not-allowed'
                }
              `}
              whileHover={isUnlocked ? { scale: 1.05, y: -2 } : undefined}
              whileTap={isUnlocked ? { scale: 0.95 } : undefined}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {!isUnlocked ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </motion.div>
              ) : isCompleted ? (
                <>
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-eco-sun fill-eco-sun" />
                  </motion.div>
                </>
              ) : (
                <span className="font-bold text-sm sm:text-base">{level}</span>
              )}
              
              <span className="text-[8px] sm:text-[10px] mt-0.5 opacity-80">
                {levelDifficulty[idx % levelDifficulty.length]}
              </span>

              {/* Unlock animation glow */}
              {isUnlocked && !isCompleted && !isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-eco-leaf/50"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Unlock hint */}
      {progress.levelsCompleted.length < totalLevels && (
        <motion.p
          className="text-center text-xs text-muted-foreground mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          🔓 Complete each level to unlock the next!
        </motion.p>
      )}
    </div>
  );
}
