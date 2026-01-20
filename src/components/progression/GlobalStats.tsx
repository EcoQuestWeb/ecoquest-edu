import { motion } from 'framer-motion';
import { TreeDeciduous, Trophy, Target, Zap } from 'lucide-react';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { PointsCounter } from '@/components/animations';

export function GlobalStats() {
  const { getGlobalStats, getTotalTreesGrown } = useLevelProgress();
  const stats = getGlobalStats();
  const treesGrown = getTotalTreesGrown();

  const statItems = [
    {
      icon: <TreeDeciduous className="w-5 h-5 text-eco-forest" />,
      value: treesGrown,
      label: 'Trees Grown',
      color: 'from-eco-leaf/20 to-eco-forest/10',
    },
    {
      icon: <Trophy className="w-5 h-5 text-eco-sun" />,
      value: stats.totalPoints,
      label: 'Total Points',
      color: 'from-eco-sun/20 to-eco-sun/10',
      isPoints: true,
    },
    {
      icon: <Target className="w-5 h-5 text-eco-sky" />,
      value: stats.levelsCompleted,
      label: 'Levels Done',
      color: 'from-eco-sky/20 to-eco-sky/10',
    },
  ];

  return (
    <motion.div
      className="eco-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌍
        </motion.span>
        <h3 className="font-display font-bold text-lg text-foreground">
          Your Eco Journey
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item, index) => (
          <motion.div
            key={item.label}
            className={`bg-gradient-to-br ${item.color} rounded-xl p-3 text-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
          >
            <motion.div
              className="w-10 h-10 mx-auto mb-2 rounded-full bg-background/50 flex items-center justify-center"
              animate={item.value > 0 ? { scale: [1, 1.1, 1] } : undefined}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {item.icon}
            </motion.div>
            <p className="font-bold text-lg text-foreground">
              {item.isPoints ? <PointsCounter value={item.value} /> : item.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Forest visualization */}
      <motion.div
        className="mt-4 p-3 bg-gradient-to-r from-eco-leaf/10 via-eco-forest/5 to-eco-leaf/10 rounded-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-center text-muted-foreground mb-2">Your Forest</p>
        <div className="flex justify-center gap-1 flex-wrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.span
              key={i}
              className="text-xl"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: i < treesGrown ? 1 : 0.2, 
                scale: 1,
              }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {i < treesGrown ? '🌳' : '🌰'}
            </motion.span>
          ))}
        </div>
        {treesGrown < 8 && (
          <p className="text-[10px] text-center text-muted-foreground mt-2">
            Complete more games to grow your forest!
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
