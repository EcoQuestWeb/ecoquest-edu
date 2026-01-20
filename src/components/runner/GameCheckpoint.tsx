import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles, Lock } from 'lucide-react';
import { useLevelProgress, GameName } from '@/contexts/LevelProgressContext';

interface GameCheckpointProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'pink' | 'yellow';
  index: number;
  situationEmoji?: string;
  situationLabel?: string;
}

const colorClasses = {
  green: 'from-eco-leaf to-primary',
  blue: 'from-eco-sky to-blue-500',
  orange: 'from-eco-sun to-orange-500',
  purple: 'from-purple-400 to-purple-600',
  teal: 'from-teal-400 to-teal-600',
  pink: 'from-pink-400 to-pink-600',
  yellow: 'from-yellow-400 to-yellow-600',
};

const bgColorClasses = {
  green: 'bg-eco-leaf/10',
  blue: 'bg-eco-sky/20',
  orange: 'bg-eco-sun/20',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  teal: 'bg-teal-100 dark:bg-teal-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
};

const situations: Record<string, { emoji: string; label: string }> = {
  'waste-sorting': { emoji: '🗑️', label: 'Waste Zone' },
  'eco-puzzle': { emoji: '🧩', label: 'Puzzle Path' },
  'eco-wordle': { emoji: '📝', label: 'Word Trail' },
  'carbon-footprint': { emoji: '👣', label: 'Carbon Check' },
  'eco-match': { emoji: '🎯', label: 'Match Point' },
  'save-the-forest': { emoji: '🌲', label: 'Forest Gate' },
  'rapid-eco-quiz': { emoji: '⚡', label: 'Speed Zone' },
  'environmental-quiz': { emoji: '🧠', label: 'Brain Power' },
  'ocean-cleanup': { emoji: '🌊', label: 'Ocean Zone' },
};

const plantEmojis = ['🌰', '🌱', '🌿', '🪴', '🌳'];

export function GameCheckpoint({ title, description, icon, path, color, index }: GameCheckpointProps) {
  const navigate = useNavigate();
  const gameKey = path.split('/').pop() || '';
  const situation = situations[gameKey];
  
  const { getGameProgress, getPlantStage } = useLevelProgress();
  const gameName = gameKey as GameName;
  const progress = getGameProgress(gameName);
  const plantStage = getPlantStage(gameName);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        type: 'spring',
        stiffness: 200,
        damping: 20,
      }}
      className="relative"
    >
      {/* Checkpoint flag */}
      <motion.div
        className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-10"
        animate={{
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-eco-sun to-orange-500 flex items-center justify-center shadow-lg">
          <span className="text-xs sm:text-sm font-bold text-white">{index + 1}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-6 sm:h-8 bg-eco-earth/50" />
      </motion.div>

      {/* Checkpoint card */}
      <motion.button
        onClick={() => navigate(path)}
        className="w-full text-left group touch-manipulation ml-4 sm:ml-6"
        whileHover={{ scale: 1.02, x: 8 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl shadow-soft border border-border/50 p-4 sm:p-5 overflow-hidden">
          {/* Animated gradient border */}
          <motion.div
            className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${colorClasses[color]}`}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
          />

          {/* Progress bar */}
          {progress.levelsCompleted.length > 0 && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-eco-leaf to-eco-forest"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: progress.levelsCompleted.length / 5 }}
              transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
            />
          )}

          {/* Situation badge */}
          {situation && (
            <motion.div
              className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 bg-muted/80 backdrop-blur-sm rounded-full px-2 py-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.4 }}
            >
              <span className="text-sm">{situation.emoji}</span>
              <span className="text-[10px] font-medium text-muted-foreground hidden sm:inline">
                {situation.label}
              </span>
            </motion.div>
          )}

          <div className="flex items-start gap-3 sm:gap-4 mt-1">
            {/* Animated icon with plant growth */}
            <motion.div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${bgColorClasses[color]} flex items-center justify-center shrink-0 relative`}
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(34, 197, 94, 0)',
                  '0 0 20px 5px rgba(34, 197, 94, 0.3)',
                  '0 0 0 0 rgba(34, 197, 94, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            >
              {icon}
              
              {/* Sparkle effect */}
              <motion.div
                className="absolute -top-1 -right-1"
                animate={{
                  scale: [0, 1, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                <Sparkles className="w-3 h-3 text-eco-sun" />
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-16">
              <h3 className="font-display font-bold text-sm sm:text-base text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {description}
              </p>
              
              {/* Level progress indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        progress.levelsCompleted.includes(i + 1)
                          ? 'bg-eco-leaf'
                          : 'bg-muted-foreground/30'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.05 }}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  Lv.{progress.currentLevel}
                </span>
              </div>
            </div>

            {/* Plant growth indicator */}
            <motion.div
              className="absolute right-12 top-1/2 -translate-y-1/2"
              animate={plantStage >= 4 ? { 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0] 
              } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xl sm:text-2xl">{plantEmojis[plantStage]}</span>
            </motion.div>

            {/* Arrow with running animation */}
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>

          {/* Running track line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-eco-leaf/50 to-transparent"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{
              duration: 1,
              delay: index * 0.1,
              ease: 'easeOut',
            }}
          />
        </div>
      </motion.button>
    </motion.div>
  );
}
