import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingIcon {
  id: number;
  emoji: string;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const floatingIcons: FloatingIcon[] = [
  { id: 1, emoji: '🌱', x: 5, delay: 0, duration: 8, size: 24 },
  { id: 2, emoji: '💧', x: 15, delay: 1.5, duration: 10, size: 20 },
  { id: 3, emoji: '🌿', x: 25, delay: 0.5, duration: 9, size: 28 },
  { id: 4, emoji: '🍃', x: 35, delay: 2, duration: 7, size: 22 },
  { id: 5, emoji: '🌳', x: 45, delay: 1, duration: 11, size: 26 },
  { id: 6, emoji: '🌻', x: 55, delay: 2.5, duration: 8, size: 24 },
  { id: 7, emoji: '🦋', x: 65, delay: 0.8, duration: 9, size: 20 },
  { id: 8, emoji: '🌍', x: 75, delay: 1.8, duration: 10, size: 28 },
  { id: 9, emoji: '♻️', x: 85, delay: 0.3, duration: 8, size: 22 },
  { id: 10, emoji: '🌊', x: 95, delay: 2.2, duration: 9, size: 26 },
];

export function FloatingEcoIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingIcons.map((icon) => (
        <motion.div
          key={icon.id}
          className="absolute opacity-30"
          style={{
            left: `${icon.x}%`,
            fontSize: icon.size,
          }}
          initial={{ y: '110vh', rotate: 0 }}
          animate={{
            y: '-10vh',
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            y: {
              duration: icon.duration,
              repeat: Infinity,
              delay: icon.delay,
              ease: 'linear',
            },
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          }}
        >
          {icon.emoji}
        </motion.div>
      ))}
    </div>
  );
}

export function ScrollingGround() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute bottom-0 flex whitespace-nowrap"
        animate={{ x: [0, -1920] }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-end gap-8 h-16 px-4"
            style={{ width: 960 }}
          >
            {[...Array(12)].map((_, j) => (
              <motion.div
                key={j}
                className="text-2xl opacity-20"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 1,
                  delay: j * 0.1,
                  repeat: Infinity,
                }}
              >
                {j % 3 === 0 ? '🌲' : j % 3 === 1 ? '🌴' : '🌳'}
              </motion.div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

interface RunnerBackgroundProps {
  children: ReactNode;
  showGround?: boolean;
}

export function RunnerBackground({ children, showGround = true }: RunnerBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Sky Gradient */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, hsl(200, 60%, 85%) 0%, hsl(85, 30%, 97%) 50%, hsl(120, 40%, 90%) 100%)',
        }}
        animate={{
          background: [
            'linear-gradient(180deg, hsl(200, 60%, 85%) 0%, hsl(85, 30%, 97%) 50%, hsl(120, 40%, 90%) 100%)',
            'linear-gradient(180deg, hsl(200, 65%, 88%) 0%, hsl(85, 35%, 95%) 50%, hsl(120, 45%, 88%) 100%)',
            'linear-gradient(180deg, hsl(200, 60%, 85%) 0%, hsl(85, 30%, 97%) 50%, hsl(120, 40%, 90%) 100%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Floating Eco Icons */}
      <FloatingEcoIcons />
      
      {/* Scrolling Ground */}
      {showGround && <ScrollingGround />}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
