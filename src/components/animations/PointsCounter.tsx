import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PointsCounterProps {
  value: number;
  className?: string;
  duration?: number;
}

export function PointsCounter({ value, className = '', duration = 1 }: PointsCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000,
  });

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <motion.span
      className={className}
      key={value}
      initial={{ scale: 1 }}
      animate={{ 
        scale: [1, 1.2, 1],
        color: ['currentColor', 'hsl(var(--eco-sun))', 'currentColor']
      }}
      transition={{ duration: 0.5 }}
    >
      {displayValue.toLocaleString()}
    </motion.span>
  );
}

interface PointsGainProps {
  points: number;
  show: boolean;
  onComplete?: () => void;
}

export function PointsGain({ points, show, onComplete }: PointsGainProps) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60, scale: [0.5, 1.2, 1, 0.8] }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <span className="text-4xl md:text-6xl font-display font-bold text-eco-sun drop-shadow-lg">
        +{points}
      </span>
    </motion.div>
  );
}
