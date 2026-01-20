import { motion } from 'framer-motion';

interface PlantGrowthProps {
  stage: number; // 0-4: seed, sprout, small plant, medium plant, tree
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

const stageEmojis = ['🌰', '🌱', '🌿', '🪴', '🌳'];
const stageLabels = ['Seed', 'Sprout', 'Growing', 'Flourishing', 'Tree!'];

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
};

const containerSizes = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

export function PlantGrowth({ stage, size = 'md', showLabel = true, animate = true }: PlantGrowthProps) {
  const currentStage = Math.min(4, Math.max(0, stage));
  const emoji = stageEmojis[currentStage];
  const label = stageLabels[currentStage];

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
      animate={animate ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={`${containerSizes[size]} rounded-full bg-gradient-to-br from-eco-leaf/20 to-eco-forest/10 flex items-center justify-center relative overflow-hidden`}
        animate={animate && currentStage >= 4 ? {
          boxShadow: [
            '0 0 0 0 rgba(34, 197, 94, 0)',
            '0 0 20px 10px rgba(34, 197, 94, 0.3)',
            '0 0 0 0 rgba(34, 197, 94, 0)',
          ],
        } : undefined}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Growing glow effect */}
        {currentStage > 0 && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-eco-leaf/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Plant emoji */}
        <motion.span
          className={sizeClasses[size]}
          animate={animate ? {
            scale: [1, 1.1, 1],
            rotate: currentStage >= 4 ? [0, 5, -5, 0] : 0,
          } : undefined}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {emoji}
        </motion.span>

        {/* Sparkle effects for tree stage */}
        {currentStage >= 4 && (
          <>
            <motion.span
              className="absolute top-1 right-2 text-xs"
              animate={{ opacity: [0, 1, 0], y: [-5, -15] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute top-3 left-2 text-xs"
              animate={{ opacity: [0, 1, 0], y: [-5, -15] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            >
              ✨
            </motion.span>
          </>
        )}
      </motion.div>

      {showLabel && (
        <motion.div
          className="text-center"
          initial={animate ? { opacity: 0, y: 10 } : undefined}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          {currentStage < 4 && (
            <p className="text-[10px] text-muted-foreground/70">
              {4 - currentStage} level{4 - currentStage > 1 ? 's' : ''} to tree
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
