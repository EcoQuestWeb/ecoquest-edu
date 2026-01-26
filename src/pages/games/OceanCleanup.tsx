import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Heart, Play, RotateCcw, Waves, Lock, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { PlantGrowth, LevelSelector, LevelUnlockAnimation } from '@/components/progression';
import { useGameSounds } from '@/hooks/useGameSounds';
import confetti from 'canvas-confetti';

// Trash items that fall from top
const TRASH_TYPES = [
  { emoji: '🥤', name: 'Plastic Cup', points: 5 },
  { emoji: '🧴', name: 'Bottle', points: 5 },
  { emoji: '🛍️', name: 'Bag', points: 5 },
  { emoji: '🥡', name: 'Box', points: 5 },
  { emoji: '📦', name: 'Cardboard', points: 10 },
  { emoji: '🥫', name: 'Can', points: 10 },
  { emoji: '👟', name: 'Shoe', points: 15 },
  { emoji: '🎒', name: 'Backpack', points: 15 },
];

// Cute fish that swim horizontally
const FISH_TYPES = ['🐠', '🐟', '🐡', '🦈', '🐙', '🦑', '🦀', '🦐', '🐢', '🐬'];

interface FallingTrash {
  id: number;
  emoji: string;
  points: number;
  x: number;
  y: number;
  speed: number;
  collected: boolean;
}

interface SwimmingFish {
  id: number;
  emoji: string;
  x: number;
  y: number;
  speed: number;
  direction: 'left' | 'right';
  dead: boolean;
}

interface LevelConfig {
  level: number;
  targetTrash: number;
  maxFishDeaths: number;
  trashSpawnRate: number;
  fishSpawnRate: number;
  trashSpeed: number;
  fishSpeed: number;
  timeLimit: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, targetTrash: 15, maxFishDeaths: 50, trashSpawnRate: 1200, fishSpawnRate: 2000, trashSpeed: 2, fishSpeed: 1.5, timeLimit: 60 },
  { level: 2, targetTrash: 20, maxFishDeaths: 45, trashSpawnRate: 1000, fishSpawnRate: 1800, trashSpeed: 2.5, fishSpeed: 2, timeLimit: 55 },
  { level: 3, targetTrash: 25, maxFishDeaths: 40, trashSpawnRate: 900, fishSpawnRate: 1500, trashSpeed: 3, fishSpeed: 2.5, timeLimit: 50 },
  { level: 4, targetTrash: 30, maxFishDeaths: 35, trashSpawnRate: 800, fishSpawnRate: 1300, trashSpeed: 3.5, fishSpeed: 3, timeLimit: 45 },
  { level: 5, targetTrash: 40, maxFishDeaths: 30, trashSpawnRate: 700, fishSpawnRate: 1000, trashSpeed: 4, fishSpeed: 3.5, timeLimit: 45 },
];

export default function OceanCleanup() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { getGameProgress, completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playSuccess, playError, playSplash, playFanfare, playPop } = useGameSounds();

  const [selectedLevel, setSelectedLevel] = useState(1);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
  const [binX, setBinX] = useState(50);
  const [binY, setBinY] = useState(80);
  const [trashItems, setTrashItems] = useState<FallingTrash[]>([]);
  const [fishItems, setFishItems] = useState<SwimmingFish[]>([]);
  const [score, setScore] = useState(0);
  const [trashCollected, setTrashCollected] = useState(0);
  const [fishDeaths, setFishDeaths] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSadFish, setShowSadFish] = useState<{ emoji: string, x: number, y: number } | null>(null);

  const itemIdRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const progress = getGameProgress('ocean-cleanup');
  const levelConfig = LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Spawn trash from top
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const trashType = TRASH_TYPES[Math.floor(Math.random() * TRASH_TYPES.length)];
      
      const newTrash: FallingTrash = {
        id: itemIdRef.current++,
        emoji: trashType.emoji,
        points: trashType.points,
        x: Math.random() * 80 + 10,
        y: -5,
        speed: levelConfig.trashSpeed + (Math.random() - 0.5),
        collected: false,
      };

      setTrashItems(prev => [...prev, newTrash]);
    }, levelConfig.trashSpawnRate);

    return () => clearInterval(interval);
  }, [gameState, levelConfig]);

  // Spawn fish swimming horizontally
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      const direction = Math.random() > 0.5 ? 'left' : 'right';
      const fishEmoji = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
      
      const newFish: SwimmingFish = {
        id: itemIdRef.current++,
        emoji: fishEmoji,
        x: direction === 'right' ? -10 : 110,
        y: 30 + Math.random() * 50, // Swim in middle to lower area
        speed: levelConfig.fishSpeed + (Math.random() - 0.5),
        direction,
        dead: false,
      };

      setFishItems(prev => [...prev, newFish]);
    }, levelConfig.fishSpawnRate);

    return () => clearInterval(interval);
  }, [gameState, levelConfig]);

  // Move trash down and fish horizontally
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      // Move trash down
      setTrashItems(prev => {
        const updated = prev.map(trash => ({
          ...trash,
          y: trash.y + trash.speed,
        }));

        // Check collision with bin
        updated.forEach(trash => {
          if (trash.collected || trash.y < binY - 10 || trash.y > binY + 10) return;

          const distance = Math.abs(trash.x - binX);
          if (distance < 12) {
            trash.collected = true;
            setScore(s => s + trash.points);
            setTrashCollected(c => c + 1);
            if (soundEnabled) playPop();
          }
        });

        return updated.filter(trash => trash.y < 105 && !trash.collected);
      });

      // Move fish horizontally
      setFishItems(prev => {
        const updated = prev.map(fish => ({
          ...fish,
          x: fish.direction === 'right' ? fish.x + fish.speed : fish.x - fish.speed,
        }));

        // Check collision with bin
        updated.forEach(fish => {
          if (fish.dead) return;

          const distanceX = Math.abs(fish.x - binX);
          const distanceY = Math.abs(fish.y - binY);
          
          if (distanceX < 10 && distanceY < 10) {
            fish.dead = true;
            setFishDeaths(d => {
              const newDeaths = d + 1;
              if (newDeaths >= levelConfig.maxFishDeaths) {
                setGameState('lost');
              }
              return newDeaths;
            });
            if (soundEnabled) playError();
            setShowSadFish({ emoji: fish.emoji, x: fish.x, y: fish.y });
            setTimeout(() => setShowSadFish(null), 1500);
          }
        });

        // Remove fish that are off screen or dead
        return updated.filter(fish => {
          if (fish.dead) return false;
          if (fish.direction === 'right' && fish.x > 110) return false;
          if (fish.direction === 'left' && fish.x < -10) return false;
          return true;
        });
      });
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, binX, binY, levelConfig.maxFishDeaths, soundEnabled, playPop, playError]);

  // Timer and win condition
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (trashCollected >= levelConfig.targetTrash) {
            setGameState('won');
            if (soundEnabled) {
              playFanfare();
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
          } else {
            setGameState('lost');
            if (soundEnabled) playError();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, trashCollected, levelConfig.targetTrash, soundEnabled, playFanfare, playError]);

  // Check win condition during play
  useEffect(() => {
    if (gameState === 'playing' && trashCollected >= levelConfig.targetTrash) {
      setGameState('won');
      if (soundEnabled) {
        playFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [trashCollected, levelConfig.targetTrash, gameState, soundEnabled, playFanfare]);

  // Handle bin movement - freely across the screen
  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'playing' || !gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setBinX(Math.max(10, Math.min(90, x)));
    setBinY(Math.max(30, Math.min(90, y)));
  }, [gameState]);

  const startGame = () => {
    if (!isLevelUnlocked('ocean-cleanup', selectedLevel)) return;

    setGameState('playing');
    setScore(0);
    setTrashCollected(0);
    setFishDeaths(0);
    setTimeLeft(levelConfig.timeLimit);
    setTrashItems([]);
    setFishItems([]);
    setBinX(50);
    setBinY(80);
    itemIdRef.current = 0;
  };

  const finishGame = async () => {
    setIsSaving(true);
    const pointsEarned = score + Math.floor(timeLeft * 0.5);

    if (pointsEarned > 0) {
      await completeGame('ocean-cleanup', pointsEarned);
      completeLevel('ocean-cleanup', selectedLevel, pointsEarned);
      
      if (selectedLevel < 5) {
        setShowUnlockAnimation(true);
      }
    }
    
    setIsSaving(false);
  };

  const goToNextLevel = () => {
    if (selectedLevel < 5) {
      setSelectedLevel(selectedLevel + 1);
      startGame();
    }
  };

  useEffect(() => {
    if (gameState === 'won') {
      finishGame();
    }
  }, [gameState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-400 to-blue-600">
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-7xl"
        >
          🌊
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-blue-400 to-blue-800 overflow-hidden">
      {/* Animated ocean background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Sun */}
        <motion.div
          className="absolute top-4 right-8 text-6xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ☀️
        </motion.div>
        
        {/* Bubbles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute w-4 h-4 bg-white/30 rounded-full"
            style={{ left: `${5 + i * 6}%`, bottom: '-20px' }}
            animate={{ 
              y: [0, -800],
              opacity: [0.6, 0],
              scale: [0.5, 1.5],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: 'easeOut',
              delay: i * 0.5,
            }}
          />
        ))}
        
        {/* Seaweed */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`seaweed-${i}`}
              className="text-4xl"
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
            >
              🌿
            </motion.div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="bg-blue-900/80 backdrop-blur-md border-b border-blue-600 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => gameState === 'playing' ? setGameState('menu') : navigate('/')}
                className="text-white hover:bg-blue-700 rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  🌊 Ocean Cleanup
                </h1>
                <p className="text-xs text-blue-200">Level {selectedLevel} • Save the ocean!</p>
              </div>
            </div>
            
            {gameState === 'playing' && (
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="text-white hover:bg-blue-700 rounded-full"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <div className="bg-red-500/80 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="text-white text-sm">🐟 {fishDeaths}/{levelConfig.maxFishDeaths}</span>
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

      <main className="h-screen pt-16">
        {gameState === 'menu' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container mx-auto px-4 py-6 max-w-lg space-y-6 relative z-10"
          >
            {/* Game info card */}
            <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center text-white">
              <motion.div 
                animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl mb-4"
              >
                🗑️
              </motion.div>
              <h2 className="font-display text-2xl font-bold mb-2">Ocean Cleanup!</h2>
              <p className="text-blue-100 mb-4 text-lg">
                Move the bin freely to catch trash 🥤🧴<br/>
                Fish swim across - don't hit them! 🐠🐟
              </p>
              
              <div className="bg-blue-900/40 rounded-2xl p-4 text-left">
                <p className="text-blue-200 font-bold mb-2 flex items-center gap-2">
                  <span className="text-xl">💡</span> How to play:
                </p>
                <ul className="text-blue-100 space-y-1 text-sm">
                  <li>• Move your finger/mouse to control the bin</li>
                  <li>• Catch falling trash for points</li>
                  <li>• Fish swim left ↔ right - avoid them!</li>
                  <li>• If {levelConfig.maxFishDeaths}+ fish die, game over!</li>
                </ul>
              </div>
            </div>

            {/* Plant progress */}
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">Your Progress</h3>
                <PlantGrowth stage={progress.plantStage} size="sm" />
              </div>
              <div className="text-sm text-blue-200 mt-2">
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
                className="w-full py-8 text-xl bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-xl rounded-2xl"
              >
                {isLevelUnlocked('ocean-cleanup', selectedLevel) ? (
                  <>
                    <Play className="w-8 h-8 mr-3" />
                    Start Level {selectedLevel}!
                  </>
                ) : (
                  <>
                    <Lock className="w-8 h-8 mr-3" />
                    Complete Level {selectedLevel - 1}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <div 
            ref={gameAreaRef}
            className="relative w-full h-full cursor-none"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
            onTouchStart={handleMove}
            style={{ touchAction: 'none' }}
          >
            {/* Progress bar */}
            <div className="absolute top-4 left-4 right-4 z-30">
              <div className="bg-blue-900/60 rounded-full p-1">
                <div className="h-4 bg-blue-800/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(trashCollected / levelConfig.targetTrash) * 100}%` }}
                  />
                </div>
                <div className="text-center text-white text-sm font-bold mt-1">
                  🗑️ {trashCollected}/{levelConfig.targetTrash} trash collected
                </div>
              </div>
            </div>

            {/* Sad fish popup */}
            <AnimatePresence>
              {showSadFish && (
                <motion.div
                  className="absolute z-40 text-center"
                  style={{ left: `${showSadFish.x}%`, top: `${showSadFish.y}%` }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{ scale: 1.5, y: -50 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <div className="bg-red-500 text-white rounded-2xl p-3 shadow-xl">
                    <span className="text-3xl">{showSadFish.emoji}</span>
                    <p className="text-sm font-bold">Oh no! 💔</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Falling trash */}
            <AnimatePresence>
              {trashItems.map(trash => (
                <motion.div
                  key={trash.id}
                  className="absolute text-4xl sm:text-5xl pointer-events-none drop-shadow-lg"
                  style={{ 
                    left: `${trash.x}%`, 
                    top: `${trash.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {trash.emoji}
                  {trash.collected && (
                    <motion.span
                      className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-300 font-bold text-lg whitespace-nowrap"
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: -30 }}
                    >
                      +{trash.points}
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Swimming fish (horizontal movement) */}
            <AnimatePresence>
              {fishItems.map(fish => (
                <motion.div
                  key={fish.id}
                  className="absolute text-4xl sm:text-5xl pointer-events-none"
                  style={{ 
                    left: `${fish.x}%`, 
                    top: `${fish.y}%`,
                    transform: `translate(-50%, -50%) scaleX(${fish.direction === 'left' ? -1 : 1})`,
                  }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: fish.dead ? 0 : 1,
                    y: [0, -5, 0, 5, 0],
                  }}
                  exit={{ scale: 0, opacity: 0, rotate: 180 }}
                  transition={{ 
                    y: { duration: 1, repeat: Infinity },
                  }}
                >
                  {fish.emoji}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Dustbin (player) - freely movable */}
            <motion.div
              className="absolute text-6xl sm:text-7xl pointer-events-none"
              style={{ 
                left: `${binX}%`, 
                top: `${binY}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🗑️
            </motion.div>

            {/* Ocean floor */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-900 to-transparent" />
          </div>
        )}

        {/* Win/Lose screens */}
        {(gameState === 'won' || gameState === 'lost') && (
          <div className="h-full flex items-center justify-center px-4 relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: gameState === 'won' ? [0, -10, 10, 0] : 0,
                }}
                transition={{ duration: 0.5, repeat: gameState === 'won' ? 3 : 0 }}
              >
                {gameState === 'won' ? '🎉' : '😢'}
              </motion.div>

              <h2 className="font-display font-bold text-3xl text-gray-800 mb-2">
                {gameState === 'won' ? 'Ocean Hero!' : 'Oh no!'}
              </h2>
              <p className="text-gray-600 mb-6 text-lg">
                {gameState === 'won' 
                  ? 'You cleaned up the ocean! 🌊✨' 
                  : fishDeaths >= levelConfig.maxFishDeaths 
                    ? 'Too many fish got hurt! 🐟💔'
                    : `Collect ${levelConfig.targetTrash} trash to win!`
                }
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-100 rounded-2xl p-4">
                  <p className="text-3xl font-bold text-green-600">{trashCollected}</p>
                  <p className="text-sm text-green-700">🗑️ Trash</p>
                </div>
                <div className="bg-blue-100 rounded-2xl p-4">
                  <p className="text-3xl font-bold text-blue-600">{score}</p>
                  <p className="text-sm text-blue-700">⭐ Points</p>
                </div>
              </div>

              {isSaving ? (
                <p className="text-gray-500">Saving... 🌊</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {gameState === 'won' && selectedLevel < 5 && (
                    <Button 
                      onClick={goToNextLevel} 
                      className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold"
                    >
                      <ChevronRight className="w-6 h-6 mr-2" />
                      Next Level (Level {selectedLevel + 1}) 🚀
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1 py-6 rounded-2xl">
                      🏠 Menu
                    </Button>
                    <Button onClick={startGame} className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-teal-500 text-white">
                      <RotateCcw className="w-5 h-5 mr-2" />
                      {gameState === 'won' ? 'Replay' : 'Try Again!'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>

      {/* Level Unlock Animation */}
      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />
    </div>
  );
}
