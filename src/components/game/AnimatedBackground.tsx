import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  type: 'nature' | 'ocean' | 'sky' | 'forest';
}

export function AnimatedBackground({ type }: AnimatedBackgroundProps) {
  if (type === 'nature') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-200" />
        
        {/* Animated clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className="absolute text-6xl"
            style={{ top: `${10 + i * 8}%`, left: '-10%' }}
            animate={{ x: ['0vw', '120vw'] }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 5,
            }}
          >
            ☁️
          </motion.div>
        ))}
        
        {/* Flying birds */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`bird-${i}`}
            className="absolute text-2xl"
            style={{ top: `${20 + i * 15}%`, left: '-5%' }}
            animate={{ 
              x: ['0vw', '110vw'],
              y: [0, -10, 0, 10, 0],
            }}
            transition={{
              x: { duration: 20 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 3 },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            🐦
          </motion.div>
        ))}
        
        {/* Ground with trees */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-green-600 to-green-400" />
        
        {/* Animated trees */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`tree-${i}`}
              className="text-5xl"
              style={{ marginBottom: '-10px' }}
              animate={{ rotate: [-2, 2, -2] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            >
              🌳
            </motion.div>
          ))}
        </div>
        
        {/* Butterflies */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute text-xl"
            style={{ 
              top: `${40 + Math.random() * 30}%`, 
              left: `${10 + i * 20}%` 
            }}
            animate={{ 
              x: [0, 30, -20, 10, 0],
              y: [0, -20, -10, -30, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5,
            }}
          >
            🦋
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'ocean') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Ocean gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-blue-500 to-blue-900" />
        
        {/* Sun */}
        <motion.div
          className="absolute top-4 right-8 text-6xl"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          ☀️
        </motion.div>
        
        {/* Swimming fish */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`fish-${i}`}
            className="absolute text-3xl"
            style={{ 
              top: `${30 + Math.random() * 50}%`,
              left: '-10%',
            }}
            animate={{ 
              x: ['0vw', '120vw'],
              y: [0, 10, -10, 5, 0],
            }}
            transition={{
              x: { duration: 15 + Math.random() * 10, repeat: Infinity, ease: 'linear', delay: i * 2 },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {['🐠', '🐟', '🐡', '🦀', '🐙'][i % 5]}
          </motion.div>
        ))}
        
        {/* Bubbles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute w-4 h-4 bg-white/30 rounded-full"
            style={{ 
              left: `${10 + i * 12}%`,
              bottom: '-20px',
            }}
            animate={{ 
              y: [0, -600],
              opacity: [0.6, 0],
              scale: [0.5, 1.5],
            }}
            transition={{
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.8,
            }}
          />
        ))}
        
        {/* Waves at surface */}
        <motion.div
          className="absolute top-[15%] left-0 right-0 text-4xl flex gap-2 whitespace-nowrap"
          animate={{ x: [0, -100, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊
        </motion.div>
      </div>
    );
  }

  if (type === 'sky') {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 via-purple-300 to-pink-200" />
        
        {/* Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-lg"
            style={{ 
              top: `${Math.random() * 40}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ⭐
          </motion.div>
        ))}
        
        {/* Rainbow */}
        <motion.div
          className="absolute top-20 left-1/4 text-8xl opacity-60"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          🌈
        </motion.div>
      </div>
    );
  }

  // Forest type
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-green-300 via-green-400 to-green-700" />
      
      {/* Falling leaves */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-2xl"
          style={{ left: `${Math.random() * 100}%`, top: '-5%' }}
          animate={{ 
            y: ['0vh', '110vh'],
            x: [0, 30, -20, 40, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            y: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: 'linear', delay: i * 0.5 },
            x: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
          }}
        >
          {['🍃', '🍂', '🌿'][i % 3]}
        </motion.div>
      ))}
    </div>
  );
}
