import { motion } from 'framer-motion';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { useLevelProgress, GameName } from '@/contexts/LevelProgressContext';
import { PlantGrowth } from './PlantGrowth';
import { PointsCounter } from '@/components/animations';

interface GameDashboardProps {
  gameName: GameName;
  gameTitle: string;
  totalLevels?: number;
}

export function GameDashboard({ gameName, gameTitle, totalLevels = 5 }: GameDashboardProps) {
  const { getGameProgress, getPlantStage } = useLevelProgress();
  const progress = getGameProgress(gameName);
  const plantStage = getPlantStage(gameName);

  const completionPercent = (progress.levelsCompleted.length / totalLevels) * 100;

  return (
    <motion.div
      className="eco-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Plant Growth Visual */}
        <PlantGrowth stage={plantStage} size="lg" />

        {/* Stats */}
        <div className="flex-1 w-full">
          <h3 className="font-display font-bold text-lg text-foreground mb-3 text-center sm:text-left">
            {gameTitle}
          </h3>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{progress.levelsCompleted.length}/{totalLevels} levels</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-eco-leaf to-eco-forest rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              className="bg-muted/50 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Trophy className="w-4 h-4 mx-auto text-eco-sun mb-1" />
              <p className="text-sm font-bold text-foreground">
                <PointsCounter value={progress.totalPoints} />
              </p>
              <p className="text-[10px] text-muted-foreground">Points</p>
            </motion.div>

            <motion.div
              className="bg-muted/50 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <Target className="w-4 h-4 mx-auto text-eco-leaf mb-1" />
              <p className="text-sm font-bold text-foreground">
                {progress.levelsCompleted.length}
              </p>
              <p className="text-[10px] text-muted-foreground">Completed</p>
            </motion.div>

            <motion.div
              className="bg-muted/50 rounded-lg p-2 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <TrendingUp className="w-4 h-4 mx-auto text-eco-sky mb-1" />
              <p className="text-sm font-bold text-foreground">
                Lv.{progress.currentLevel}
              </p>
              <p className="text-[10px] text-muted-foreground">Current</p>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
