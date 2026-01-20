import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LevelUnlockAnimationProps {
  show: boolean;
  level: number;
  onComplete?: () => void;
}

export function LevelUnlockAnimation({ show, level, onComplete }: LevelUnlockAnimationProps) {
  useEffect(() => {
    if (show) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#fbbf24', '#60a5fa'],
      });

      // Auto-dismiss after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-card rounded-3xl p-8 shadow-2xl max-w-sm mx-4 text-center"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Unlock icon animation */}
            <motion.div
              className="relative w-24 h-24 mx-auto mb-4"
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
            >
              {/* Lock breaking effect */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center text-6xl"
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                🔓
              </motion.div>
              
              {/* Glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-eco-sun"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.3, 1.1],
                  opacity: [0, 1, 0.5],
                }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />

              {/* Sparkles */}
              <motion.span
                className="absolute -top-2 -right-2 text-2xl"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.5 }}
              >
                ✨
              </motion.span>
              <motion.span
                className="absolute -bottom-2 -left-2 text-2xl"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: -360 }}
                transition={{ delay: 0.6 }}
              >
                ⭐
              </motion.span>
            </motion.div>

            <motion.h2
              className="font-display font-bold text-2xl text-foreground mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Level {level} Unlocked!
            </motion.h2>

            <motion.p
              className="text-muted-foreground mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Great job! Keep going to grow your plant! 🌱
            </motion.p>

            <motion.button
              className="px-6 py-2 bg-gradient-to-r from-eco-leaf to-eco-forest text-white rounded-full font-medium shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
