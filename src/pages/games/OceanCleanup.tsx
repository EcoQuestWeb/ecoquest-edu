import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Heart, Play, RotateCcw, Waves, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { PlantGrowth, LevelSelector, LevelUnlockAnimation } from '@/components/progression';
import confetti from 'canvas-confetti';

// Trash items that need to be collected
const TRASH_TYPES = [
  { emoji: '🥤', name: 'Plastic Cup', points: 5 },
  { emoji: '🧴', name: 'Plastic Bottle', points: 5 },
  { emoji: '🛍️', name: 'Plastic Bag', points: 5 },
  { emoji: '🥡', name: 'Food Container', points: 5 },
  { emoji: '🍶', name: 'Oil Container', points: 10 },
  { emoji: '🪣', name: 'Bucket', points: 10 },
  { emoji: '📦', name: 'Cardboard', points: 5 },
  { emoji: '🥫', name: 'Can', points: 5 },
];

// Obstacles to avoid
const OBSTACLES = [
  { emoji: '🦈', name: 'Shark' },
  { emoji: '🪸', name: 'Coral' },
  { emoji: '🪨', name: 'Rock' },
  { emoji: '🦑', name: 'Squid' },
];

// Sea creatures (harmless, just for decoration)
const SEA_LIFE = ['🐠', '🐟', '🐡', '🦀', '🐢', '🐙', '🦐', '🐚'];

interface GameItem {
  id: number;
  type: 'trash' | 'obstacle' | 'sealife';
  emoji: string;
  name?: string;
  points?: number;
  x: number;
  y: number;
  collected: boolean;
  hit: boolean;
}

interface LevelConfig {
  level: number;
  targetItems: number;
  speed: number;
  spawnRate: number;
  obstacleChance: number;
  lives: number;
  timeLimit: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, targetItems: 10, speed: 3, spawnRate: 1500, obstacleChance: 0.1, lives: 3, timeLimit: 60 },
  { level: 2, targetItems: 15, speed: 4, spawnRate: 1200, obstacleChance: 0.2, lives: 3, timeLimit: 55 },
  { level: 3, targetItems: 20, speed: 5, spawnRate: 1000, obstacleChance: 0.25, lives: 3, timeLimit: 50 },
  { level: 4, targetItems: 25, speed: 6, spawnRate: 800, obstacleChance: 0.3, lives: 3, timeLimit: 45 },
  { level: 5, targetItems: 30, speed: 7, spawnRate: 700, obstacleChance: 0.35, lives: 3, timeLimit: 40 },
];

export default function OceanCleanup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { getGameProgress, completeLevel, isLevelUnlocked } = useLevelProgress();

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'won' | 'lost'>('menu');
  const [playerX, setPlayerX] = useState(50);
  const [items, setItems] = useState<GameItem[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [collected, setCollected] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [mascotMood, setMascotMood] = useState<'running' | 'celebrating' | 'sad'>('running');
  const [isSaving, setIsSaving] = useState(false);

  const itemIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const progress = getGameProgress('ocean-cleanup');
  const levelConfig = LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Spawn items
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const random = Math.random();
      let newItem: GameItem;

      if (random < levelConfig.obstacleChance) {
        // Spawn obstacle
        const obstacle = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
        newItem = {
          id: itemIdRef.current++,
          type: 'obstacle',
          emoji: obstacle.emoji,
          name: obstacle.name,
          x: Math.random() * 80 + 10,
          y: -10,
          collected: false,
          hit: false,
        };
      } else if (random < levelConfig.obstacleChance + 0.15) {
        // Spawn sea life (decoration)
        newItem = {
          id: itemIdRef.current++,
          type: 'sealife',
          emoji: SEA_LIFE[Math.floor(Math.random() * SEA_LIFE.length)],
          x: Math.random() * 80 + 10,
          y: -10,
          collected: false,
          hit: false,
        };
      } else {
        // Spawn trash
        const trash = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
        newItem = {
          id: itemIdRef.current++,
          type: 'trash',
          emoji: trash.emoji,
          name: trash.name,
          points: trash.points,
          x: Math.random() * 80 + 10,
          y: -10,
          collected: false,
          hit: false,
        };
      }

      setItems(prev => [...prev, newItem]);
    }, levelConfig.spawnRate);

    return () => clearInterval(interval);
  }, [gameState, levelConfig]);

  // Move items down
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setItems(prev => {
        const updated = prev.map(item => ({
          ...item,
          y: item.y + levelConfig.speed,
        }));

        // Check for collection/collision
        updated.forEach(item => {
          if (item.collected || item.hit || item.y < 70 || item.y > 95) return;

          const distance = Math.abs(item.x - playerX);
          if (distance < 15) {
            if (item.type === 'trash') {
              item.collected = true;
              setScore(s => s + (item.points || 5));
              setCollected(c => c + 1);
              setMascotMood('celebrating');
              setTimeout(() => setMascotMood('running'), 500);
            } else if (item.type === 'obstacle') {
              item.hit = true;
              setLives(l => {
                const newLives = l - 1;
                if (newLives <= 0) {
                  setGameState('lost');
                  setMascotMood('sad');
                }
                return newLives;
              });
              setMascotMood('sad');
              setTimeout(() => setMascotMood('running'), 1000);
            }
          }
        });

        // Remove off-screen items
        return updated.filter(item => item.y < 110);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, playerX, levelConfig.speed]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (collected >= levelConfig.targetItems) {
            setGameState('won');
            setMascotMood('celebrating');
          } else {
            setGameState('lost');
            setMascotMood('sad');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, collected, levelConfig.targetItems]);

  // Check win condition
  useEffect(() => {
    if (gameState === 'playing' && collected >= levelConfig.targetItems) {
      setGameState('won');
      setMascotMood('celebrating');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [collected, levelConfig.targetItems, gameState]);

  // Handle player movement
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPlayerX(Math.max(10, Math.min(90, x)));
  }, [gameState]);

  const startGame = () => {
    if (!isLevelUnlocked('ocean-cleanup', selectedLevel)) return;

    setGameState('playing');
    setScore(0);
    setLives(levelConfig.lives);
    setCollected(0);
    setTimeLeft(levelConfig.timeLimit);
    setItems([]);
    setPlayerX(50);
    setMascotMood('running');
  };

  const finishGame = async () => {
    setIsSaving(true);
    
    // Points: base points + time bonus
    const basePoints = score;
    const timeBonus = Math.floor(timeLeft * 0.5);
    const pointsEarned = basePoints + timeBonus;

    if (pointsEarned > 0) {
      await completeGame('ocean-cleanup', pointsEarned);
      completeLevel('ocean-cleanup', selectedLevel, pointsEarned);
      
      // Check if next level unlocked
      if (selectedLevel < 5) {
        setShowUnlockAnimation(true);
      }
    }
    
    setIsSaving(false);
  };

  useEffect(() => {
    if (gameState === 'won') {
      finishGame();
    }
  }, [gameState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-400 to-blue-600">
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white font-display text-xl"
        >
          Loading Ocean Cleanup...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 overflow-hidden">
      {/* Header */}
      <header className="bg-blue-800/80 backdrop-blur-md border-b border-blue-600 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="text-white hover:bg-blue-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Waves className="w-5 h-5" />
                  Ocean Cleanup Runner
                </h1>
                <p className="text-xs text-blue-200">Collect trash, save the ocean!</p>
              </div>
            </div>
            
            {gameState === 'playing' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-blue-900/50 px-3 py-1 rounded-full">
                  {Array.from({ length: levelConfig.lives }).map((_, i) => (
                    <motion.span 
                      key={i}
                      animate={i < lives ? {} : { scale: 0 }}
                      className="text-lg"
                    >
                      {i < lives ? '❤️' : '🖤'}
                    </motion.span>
                  ))}
                </div>
                <div className="bg-blue-900/50 px-3 py-1 rounded-full">
                  <span className="text-white font-bold">⏱️ {timeLeft}s</span>
                </div>
                <div className="bg-yellow-500/80 px-3 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-white" />
                  <span className="text-white font-bold">{score}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto space-y-6"
          >
            {/* Game info card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center text-white">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                🌊
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Ocean Cleanup Runner</h2>
              <p className="text-blue-100 mb-4">
                Help clean the ocean! Collect floating trash 🥤🧴🛍️ while avoiding dangerous obstacles 🦈🪸
              </p>
              
              {/* Marine pollution facts */}
              <div className="bg-blue-900/30 rounded-xl p-4 text-left text-sm">
                <p className="text-blue-200 font-medium mb-2">🌍 Did you know?</p>
                <p className="text-blue-100">
                  8 million tons of plastic enter our oceans every year. 
                  By playing this game, you're learning to help protect marine life!
                </p>
              </div>
            </div>

            {/* Plant progress */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Your Progress</h3>
                <PlantGrowth stage={progress.plantStage} size="sm" />
              </div>
              <div className="text-sm text-blue-200">
                Levels completed: {progress.levelsCompleted.length}/5
              </div>
            </div>

            {/* Level selector */}
            <LevelSelector
              gameName="ocean-cleanup"
              onSelectLevel={setSelectedLevel}
              currentLevel={selectedLevel}
            />

            {/* Start button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={startGame}
                disabled={!isLevelUnlocked('ocean-cleanup', selectedLevel)}
                className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-lg"
              >
                {isLevelUnlocked('ocean-cleanup', selectedLevel) ? (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Start Level {selectedLevel}
                  </>
                ) : (
                  <>
                    <Lock className="w-6 h-6 mr-2" />
                    Complete Level {selectedLevel - 1} First
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div 
            ref={gameAreaRef}
            className="relative w-full max-w-lg mx-auto aspect-[3/4] bg-gradient-to-b from-blue-400/50 to-blue-800/50 rounded-2xl overflow-hidden touch-none cursor-pointer"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
          >
            {/* Progress bar */}
            <div className="absolute top-2 left-2 right-2 h-3 bg-blue-900/50 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-400 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${(collected / levelConfig.targetItems) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold">
                {collected}/{levelConfig.targetItems}
              </div>
            </div>

            {/* Floating items */}
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  className="absolute text-3xl pointer-events-none"
                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: item.collected || item.hit ? 0 : 1,
                    rotate: 0,
                    y: item.collected ? -50 : 0,
                  }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {item.emoji}
                  {item.collected && (
                    <motion.span
                      className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-sm whitespace-nowrap"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -20 }}
                    >
                      +{item.points}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Player (diver/boat) */}
            <motion.div
              className="absolute bottom-16 text-5xl"
              style={{ left: `${playerX}%`, transform: 'translateX(-50%)' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🤿
            </motion.div>

            {/* Level indicator */}
            <div className="absolute bottom-2 left-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <span className="text-white text-xs font-medium">Level {selectedLevel}</span>
            </div>

            {/* Wave effect at bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-blue-900/80 to-transparent"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex justify-around text-2xl opacity-50">
                {'🌊'.repeat(8).split('').map((w, i) => (
                  <motion.span 
                    key={i}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Win/Lose screens */}
        {(gameState === 'won' || gameState === 'lost') && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center text-white"
          >
            <div className="text-5xl mb-4">{gameState === 'won' ? '🎉' : '😢'}</div>
            
            <h2 className="font-display text-3xl font-bold mt-4 mb-2">
              {gameState === 'won' ? '🎉 Ocean Saved!' : '💔 Try Again!'}
            </h2>
            
            <p className="text-blue-100 mb-4">
              {gameState === 'won' 
                ? `You collected ${collected} pieces of trash and helped clean the ocean!`
                : `You collected ${collected}/${levelConfig.targetItems} items. Keep trying!`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-900/30 rounded-xl p-4">
                <p className="text-sm text-blue-200">Score</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
              <div className="bg-green-900/30 rounded-xl p-4">
                <p className="text-sm text-green-200">Points Earned</p>
                <p className="text-2xl font-bold">
                  {gameState === 'won' ? score + Math.floor(timeLeft * 0.5) : 0}
                </p>
              </div>
            </div>

            {isSaving ? (
              <p className="text-blue-200">Saving progress...</p>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  onClick={() => setGameState('menu')}
                  className="flex-1 bg-gradient-to-r from-green-500 to-teal-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Level unlock animation */}
      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />
    </div>
  );
}
