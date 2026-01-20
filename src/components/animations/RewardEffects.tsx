import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface SuccessGlowProps {
  show: boolean;
  children: React.ReactNode;
}

export function SuccessGlow({ show, children }: SuccessGlowProps) {
  return (
    <motion.div
      animate={show ? {
        boxShadow: [
          '0 0 0 0 hsla(120, 60%, 40%, 0)',
          '0 0 30px 10px hsla(120, 60%, 40%, 0.4)',
          '0 0 0 0 hsla(120, 60%, 40%, 0)',
        ],
      } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="rounded-2xl"
    >
      {children}
    </motion.div>
  );
}

interface CorrectAnswerEffectProps {
  show: boolean;
  onComplete?: () => void;
}

export function CorrectAnswerEffect({ show, onComplete }: CorrectAnswerEffectProps) {
  useEffect(() => {
    if (show) {
      // Green confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#16a34a', '#4ade80', '#86efac'],
        ticks: 100,
        gravity: 1.2,
        scalar: 0.8,
      });
      
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return null;
}

interface GameCompleteEffectProps {
  show: boolean;
  onComplete?: () => void;
}

export function GameCompleteEffect({ show, onComplete }: GameCompleteEffectProps) {
  useEffect(() => {
    if (show) {
      // Multiple bursts
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          clearInterval(interval);
          onComplete?.();
          return;
        }
        
        confetti({
          particleCount: 30,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#16a34a', '#eab308', '#f59e0b', '#3b82f6'],
        });
        
        confetti({
          particleCount: 30,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#16a34a', '#eab308', '#f59e0b', '#3b82f6'],
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-6xl md:text-8xl"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PulseRingProps {
  show: boolean;
}

export function PulseRing({ show }: PulseRingProps) {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="absolute inset-0 rounded-full border-4 border-accent pointer-events-none"
    />
  );
}
