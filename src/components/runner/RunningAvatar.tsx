import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface RunningAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isRunning?: boolean;
  className?: string;
}

export function RunningAvatar({ size = 'md', isRunning = true, className = '' }: RunningAvatarProps) {
  const { profile } = useAuth();
  
  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-24 h-24 text-4xl',
  };

  const avatar = profile?.gender === 'female' ? '🏃‍♀️' : '🏃‍♂️';

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} flex items-center justify-center`}
      animate={isRunning ? {
        y: [0, -8, 0],
        scaleX: [1, 1.05, 1],
      } : {}}
      transition={{
        duration: 0.4,
        repeat: isRunning ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      <span className="drop-shadow-lg">{avatar}</span>
    </motion.div>
  );
}

interface CollectibleProps {
  emoji: string;
  collected: boolean;
  onCollect?: () => void;
  delay?: number;
}

export function Collectible({ emoji, collected, onCollect, delay = 0 }: CollectibleProps) {
  return (
    <motion.button
      onClick={onCollect}
      className="relative touch-manipulation"
      initial={{ scale: 0, rotate: -180 }}
      animate={collected ? {
        scale: [1, 1.5, 0],
        opacity: [1, 0.8, 0],
        y: -40,
      } : {
        scale: 1,
        rotate: 0,
      }}
      transition={{
        delay: collected ? 0 : delay,
        duration: collected ? 0.5 : 0.4,
        type: 'spring',
      }}
      whileHover={!collected ? { scale: 1.2 } : {}}
      whileTap={!collected ? { scale: 0.9 } : {}}
      disabled={collected}
    >
      <motion.span
        className="text-3xl drop-shadow-md"
        animate={!collected ? {
          y: [0, -5, 0],
          rotate: [-5, 5, -5],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: !collected ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {emoji}
      </motion.span>
      
      {/* Glow effect */}
      {!collected && (
        <motion.div
          className="absolute inset-0 rounded-full bg-eco-sun/30 blur-md -z-10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}

interface CoinBurstProps {
  show: boolean;
  count?: number;
  onComplete?: () => void;
}

export function CoinBurst({ show, count = 5, onComplete }: CoinBurstProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ scale: 0, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0.5],
            x: (Math.random() - 0.5) * 200,
            y: -100 - Math.random() * 100,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.1,
            ease: 'easeOut',
          }}
          onAnimationComplete={i === count - 1 ? onComplete : undefined}
        >
          🪙
        </motion.div>
      ))}
    </div>
  );
}
