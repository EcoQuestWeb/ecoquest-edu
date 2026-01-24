import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, Target, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';

interface TrashItem {
  id: number;
  x: number;
  y: number;
  type: 'trash' | 'recyclable' | 'hazard';
  emoji: string;
  points: number;
  speed: number;
}

interface LevelConfig {
  level: number;
  targetScore: number;
  timeLimit: number;
  spawnRate: number;
  trashSpeed: number;
  hazardChance: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, targetScore: 50, timeLimit: 45, spawnRate: 1500, trashSpeed: 2, hazardChance: 0.05 },
  { level: 2, targetScore: 80, timeLimit: 40, spawnRate: 1200, trashSpeed: 2.5, hazardChance: 0.1 },
  { level: 3, targetScore: 120, timeLimit: 35, spawnRate: 1000, trashSpeed: 3, hazardChance: 0.15 },
  { level: 4, targetScore: 160, timeLimit: 30, spawnRate: 800, trashSpeed: 3.5, hazardChance: 0.2 },
  { level: 5, targetScore: 200, timeLimit: 30, spawnRate: 700, trashSpeed: 4, hazardChance: 0.25 },
];

const TRASH_TYPES = [
  { type: 'trash', emoji: '🥤', points: 5 },
  { type: 'trash', emoji: '📦', points: 5 },
  { type: 'trash', emoji: '🛍️', points: 5 },
  { type: 'trash', emoji: '🍔', points: 5 },
  { type: 'recyclable', emoji: '🥫', points: 10 },
  { type: 'recyclable', emoji: '📰', points: 10 },
  { type: 'recyclable', emoji: '🔋', points: 10 },
  { type: 'hazard', emoji: '☢️', points: -20 },
  { type: 'hazard', emoji: '💀', points: -20 },
] as const;

export default function TrashShooter() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [comboCount, setComboCount] = useState(0);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const trashIdRef = useRef(0);
  const lastHitTimeRef = useRef(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const spawnTrash = useCallback(() => {
    const config = getLevelConfig();
    const isHazard = Math.random() < config.hazardChance;
    
    let trashType;
    if (isHazard) {
      const hazards = TRASH_TYPES.filter(t => t.type === 'hazard');
      trashType = hazards[Math.floor(Math.random() * hazards.length)];
    } else {
      const nonHazards = TRASH_TYPES.filter(t => t.type !== 'hazard');
      trashType = nonHazards[Math.floor(Math.random() * nonHazards.length)];
    }

    const newTrash: TrashItem = {
      id: trashIdRef.current++,
      x: Math.random() * 80 + 10,
      y: -10,
      type: trashType.type as 'trash' | 'recyclable' | 'hazard',
      emoji: trashType.emoji,
      points: trashType.points,
      speed: config.trashSpeed + Math.random() * 1.5,
    };

    setTrashItems(prev => [...prev, newTrash]);
  }, [selectedLevel]);

  const handleShoot = (item: TrashItem) => {
    const now = Date.now();
    const timeSinceLastHit = now - lastHitTimeRef.current;
    lastHitTimeRef.current = now;

    // Combo system
    if (timeSinceLastHit < 1500 && item.type !== 'hazard') {
      setComboCount(prev => prev + 1);
    } else {
      setComboCount(item.type === 'hazard' ? 0 : 1);
    }

    const comboBonus = Math.min(comboCount * 2, 10);
    const finalPoints = item.type === 'hazard' ? item.points : item.points + comboBonus;

    setScore(prev => Math.max(0, prev + finalPoints));
    setTrashItems(prev => prev.filter(t => t.id !== item.id));

    if (item.type === 'hazard') {
      setMisses(prev => prev + 1);
      setComboCount(0);
    } else {
      setHits(prev => prev + 1);
    }
  };

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const config = getLevelConfig();
    const spawnInterval = setInterval(spawnTrash, config.spawnRate);
    
    const moveInterval = setInterval(() => {
      setTrashItems(prev => 
        prev
          .map(item => ({ ...item, y: item.y + item.speed }))
          .filter(item => {
            if (item.y > 100) {
              if (item.type !== 'hazard') {
                setMisses(m => m + 1);
              }
              return false;
            }
            return true;
          })
      );
    }, 50);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [gameState, spawnTrash]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  const startGame = () => {
    const config = getLevelConfig();
    setScore(0);
    setTimeLeft(config.timeLimit);
    setTrashItems([]);
    setHits(0);
    setMisses(0);
    setComboCount(0);
    trashIdRef.current = 0;
    setGameState('playing');
  };

  const finishGame = async () => {
    setGameState('finished');
    setIsSaving(true);

    const config = getLevelConfig();
    const won = score >= config.targetScore;
    
    // Points: accuracy bonus + score
    const accuracy = hits > 0 ? hits / (hits + misses) : 0;
    const basePoints = Math.floor(score / 10);
    const accuracyBonus = Math.floor(accuracy * 10);
    const pointsEarned = basePoints + accuracyBonus;

    if (pointsEarned > 0) {
      await completeGame('trash-shooter', pointsEarned);
      
      if (won) {
        completeLevel('trash-shooter', selectedLevel, pointsEarned);
        if (selectedLevel < 5) {
          setShowUnlockAnimation(true);
        }
      }
    }

    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="trash-shooter"
        gameTitle="Trash Shooter 🎯"
        gameDescription="Shoot the trash! Avoid hazardous waste!"
        gameIcon={<Target className="w-6 h-6 text-orange-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();
  const won = score >= config.targetScore;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-blue-100 to-green-100 overflow-hidden">
      {/* Level Unlock Animation */}
      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />

      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setGameState('menu')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground">
                  Trash Shooter - Level {selectedLevel}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Target: {config.targetScore} points
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-eco-sun/20 px-3 py-1 rounded-full">
                <span className="font-bold text-eco-earth">{score}</span>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                timeLeft <= 10 ? 'bg-destructive/20 text-destructive' : 'bg-muted'
              }`}>
                <span className="font-bold">{timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Area */}
      {gameState === 'playing' && (
        <div 
          ref={gameAreaRef}
          className="relative w-full h-screen pt-20 cursor-crosshair"
          style={{ touchAction: 'none' }}
        >
          {/* Combo indicator */}
          {comboCount > 1 && (
            <motion.div
              key={comboCount}
              className="fixed top-24 left-1/2 -translate-x-1/2 bg-eco-sun/90 text-eco-earth px-4 py-2 rounded-full font-bold z-40"
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              🔥 {comboCount}x Combo!
            </motion.div>
          )}

          {/* Trash items */}
          <AnimatePresence>
            {trashItems.map(item => (
              <motion.button
                key={item.id}
                className={`absolute text-4xl sm:text-5xl cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  item.type === 'hazard' ? 'animate-pulse' : ''
                }`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={() => handleShoot(item)}
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: item.type === 'hazard' ? [0, 10, -10, 0] : 0 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.15 }}
                whileTap={{ scale: 0.8 }}
              >
                {item.emoji}
                {item.type === 'recyclable' && (
                  <span className="absolute -top-1 -right-1 text-xs bg-eco-leaf text-white px-1 rounded">+10</span>
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-eco-forest/30 to-transparent" />

          {/* Crosshair hint */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center text-muted-foreground text-sm">
            <Crosshair className="w-6 h-6 mx-auto mb-1 opacity-50" />
            <p>Tap trash to shoot! Avoid ☢️ hazards!</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'finished' && (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="eco-card max-w-md w-full text-center"
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              won ? 'bg-eco-leaf/20' : 'bg-destructive/20'
            }`}>
              <span className="text-5xl">{won ? '🎉' : '😢'}</span>
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              {won ? 'Level Complete!' : 'Time\'s Up!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {won ? 'Great shooting! You cleaned up the trash!' : `You needed ${config.targetScore} points to pass.`}
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{score}</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
              <div className="bg-eco-leaf/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-eco-forest">{hits}</p>
                <p className="text-xs text-muted-foreground">Hits</p>
              </div>
              <div className="bg-eco-sun/20 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-eco-earth">
                  {hits > 0 ? Math.round((hits / (hits + misses)) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>

            {isSaving ? (
              <p className="text-muted-foreground">Saving progress...</p>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1">
                  Back
                </Button>
                <Button onClick={startGame} className="flex-1 gradient-nature text-primary-foreground">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
