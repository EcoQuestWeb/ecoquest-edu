import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface GameMascotProps {
  mood?: 'happy' | 'running' | 'celebrating' | 'sad' | 'thinking';
  size?: 'sm' | 'md' | 'lg';
  showSpeech?: boolean;
  speechText?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-20 h-20',
  lg: 'w-32 h-32',
};

const moodAnimations = {
  happy: {
    y: [0, -5, 0],
    rotate: [0, 5, -5, 0],
  },
  running: {
    // Move forward (left-to-right) consistently
    x: [0, 8, 0],
    y: [0, -8, 0, -8, 0],
  },
  celebrating: {
    scale: [1, 1.2, 1],
    rotate: [0, 10, -10, 0],
  },
  sad: {
    y: [0, 2, 0],
    rotate: [0, -3, 0],
  },
  thinking: {
    rotate: [0, 5, 0],
    scale: [1, 1.05, 1],
  },
};

export function GameMascot({ 
  mood = 'happy', 
  size = 'md',
  showSpeech = false,
  speechText = "Let's save the planet!"
}: GameMascotProps) {
  const { profile } = useAuth();
  const isMale = profile?.gender === 'Male';

  // Simple child-friendly mascot using CSS and emoji
  const mascotColor = isMale ? 'from-blue-400 to-blue-600' : 'from-pink-400 to-pink-600';
  const mascotEmoji = mood === 'celebrating' ? '🎉' : mood === 'sad' ? '😢' : '😊';

  return (
    <motion.div className="relative flex flex-col items-center">
      {/* Speech bubble */}
      {showSpeech && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-card rounded-xl px-3 py-1.5 shadow-lg border border-border z-10 whitespace-nowrap"
        >
          <p className="text-xs font-medium text-foreground">{speechText}</p>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-card border-b border-r border-border rotate-45" />
        </motion.div>
      )}

      {/* Mascot body */}
      <motion.div
        className={`${sizeClasses[size]} relative`}
        animate={moodAnimations[mood]}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Body circle */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${mascotColor} shadow-lg`}>
          {/* Face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative"
              animate={mood === 'running' ? { y: [0, -2, 0] } : undefined}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              {/* Eyes */}
              <div className="flex gap-2 mb-1">
                <motion.div 
                  className="w-2 h-2 bg-white rounded-full"
                  animate={mood === 'thinking' ? { scaleY: [1, 0.3, 1] } : undefined}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div 
                  className="w-2 h-2 bg-white rounded-full"
                  animate={mood === 'thinking' ? { scaleY: [1, 0.3, 1] } : undefined}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                />
              </div>
              
              {/* Mouth */}
              <motion.div
                className={`w-4 h-2 rounded-b-full ${
                  mood === 'sad' ? 'bg-white/50 rounded-t-full rounded-b-none' : 'bg-white'
                }`}
                animate={mood === 'celebrating' ? { scale: [1, 1.2, 1] } : undefined}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Blush cheeks */}
          <div className="absolute left-1 top-1/2 w-2 h-1.5 bg-red-300/50 rounded-full" />
          <div className="absolute right-1 top-1/2 w-2 h-1.5 bg-red-300/50 rounded-full" />
        </div>

        {/* Leaf accessory */}
        <motion.span
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🌱
        </motion.span>

        {/* Running legs effect */}
        {mood === 'running' && (
          <>
            <motion.div
              className="absolute -bottom-2 left-1/4 w-2 h-4 bg-gradient-to-b from-current to-transparent rounded-full opacity-50"
              style={{ color: isMale ? '#60a5fa' : '#f472b6' }}
              animate={{ rotate: [0, 30, 0, -30, 0], scaleY: [1, 0.8, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-2 right-1/4 w-2 h-4 bg-gradient-to-b from-current to-transparent rounded-full opacity-50"
              style={{ color: isMale ? '#60a5fa' : '#f472b6' }}
              animate={{ rotate: [0, -30, 0, 30, 0], scaleY: [1, 0.8, 1] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
            />
          </>
        )}

        {/* Celebration particles */}
        {mood === 'celebrating' && (
          <>
            <motion.span
              className="absolute -top-4 -left-2 text-sm"
              animate={{ y: [-10, -20], opacity: [1, 0], rotate: [0, 360] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⭐
            </motion.span>
            <motion.span
              className="absolute -top-4 -right-2 text-sm"
              animate={{ y: [-10, -20], opacity: [1, 0], rotate: [0, -360] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            >
              🌟
            </motion.span>
            <motion.span
              className="absolute -top-2 left-1/2 text-xs"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.5 }}
            >
              ✨
            </motion.span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
