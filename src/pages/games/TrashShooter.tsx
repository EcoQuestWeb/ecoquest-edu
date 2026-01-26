import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, Target, Volume2, VolumeX, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import { useGameSounds } from '@/hooks/useGameSounds';
import confetti from 'canvas-confetti';

// Environmental themed items for bubble shooter (eco items only)
const SHOOTER_ITEMS = [
  { emoji: '🌳', type: 'tree', color: 'bg-green-500' },
  { emoji: '🌍', type: 'earth', color: 'bg-blue-500' },
  { emoji: '🐟', type: 'fish', color: 'bg-cyan-500' },
  { emoji: '💧', type: 'water', color: 'bg-blue-400' },
  { emoji: '🌱', type: 'sapling', color: 'bg-lime-500' },
  { emoji: '⭐', type: 'star', color: 'bg-yellow-400' },
];

interface GridCell {
  id: number;
  row: number;
  col: number;
  type: string;
  emoji: string;
  color: string;
  popping: boolean;
}

interface ShootingBubble {
  id: number;
  x: number;
  y: number;
  type: string;
  emoji: string;
  color: string;
  vx: number;
  vy: number;
}

interface LevelConfig {
  level: number;
  targetScore: number;
  timeLimit: number;
  gridRows: number;
  shooterSpeed: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, targetScore: 100, timeLimit: 60, gridRows: 4, shooterSpeed: 12 },
  { level: 2, targetScore: 150, timeLimit: 55, gridRows: 5, shooterSpeed: 13 },
  { level: 3, targetScore: 200, timeLimit: 50, gridRows: 5, shooterSpeed: 14 },
  { level: 4, targetScore: 250, timeLimit: 45, gridRows: 6, shooterSpeed: 15 },
  { level: 5, targetScore: 300, timeLimit: 45, gridRows: 6, shooterSpeed: 16 },
];

const COLS = 8;
const CELL_SIZE = 48;
const CELL_OFFSET = CELL_SIZE / 2;

export default function TrashShooter() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playMatch, playPop, playFanfare, playError } = useGameSounds();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [grid, setGrid] = useState<(GridCell | null)[][]>([]);
  const [currentBubble, setCurrentBubble] = useState<typeof SHOOTER_ITEMS[0] | null>(null);
  const [nextBubble, setNextBubble] = useState<typeof SHOOTER_ITEMS[0] | null>(null);
  const [shootingBubble, setShootingBubble] = useState<ShootingBubble | null>(null);
  const [aimAngle, setAimAngle] = useState(90);
  const [combo, setCombo] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [levelWon, setLevelWon] = useState(false);

  const gameAreaRef = useRef<HTMLDivElement>(null);
  const bubbleIdRef = useRef(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const getRandomBubble = () => SHOOTER_ITEMS[Math.floor(Math.random() * SHOOTER_ITEMS.length)];

  const initializeGrid = () => {
    const config = getLevelConfig();
    const newGrid: (GridCell | null)[][] = [];

    for (let row = 0; row < config.gridRows; row++) {
      const gridRow: (GridCell | null)[] = [];
      const numCols = row % 2 === 0 ? COLS : COLS - 1;
      
      for (let col = 0; col < numCols; col++) {
        const item = getRandomBubble();
        gridRow.push({
          id: bubbleIdRef.current++,
          row,
          col,
          type: item.type,
          emoji: item.emoji,
          color: item.color,
          popping: false,
        });
      }
      newGrid.push(gridRow);
    }

    return newGrid;
  };

  const startGame = () => {
    const config = getLevelConfig();
    setGrid(initializeGrid());
    setScore(0);
    setTimeLeft(config.timeLimit);
    setCombo(0);
    setCurrentBubble(getRandomBubble());
    setNextBubble(getRandomBubble());
    setShootingBubble(null);
    setAimAngle(90);
    setLevelWon(false);
    bubbleIdRef.current = 0;
    setGameState('playing');
  };

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

  // Get cell position
  const getCellPosition = (row: number, col: number) => {
    const offset = row % 2 === 0 ? 0 : CELL_OFFSET;
    return {
      x: col * CELL_SIZE + CELL_OFFSET + offset + 10,
      y: row * (CELL_SIZE - 5) + CELL_OFFSET + 80,
    };
  };

  // Find connected cells of same type using flood fill
  const findConnectedCells = (grid: (GridCell | null)[][], startRow: number, startCol: number, type: string): Set<string> => {
    const connected = new Set<string>();
    const queue: [number, number][] = [[startRow, startCol]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      const key = `${row},${col}`;
      
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = grid[row]?.[col];
      if (!cell || cell.type !== type) continue;

      connected.add(key);

      // Get neighbors (6 directions for hex grid)
      const isEvenRow = row % 2 === 0;
      const neighbors = isEvenRow
        ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
        : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];

      for (const [dr, dc] of neighbors) {
        const newRow = row + dr;
        const newCol = col + dc;
        if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < (grid[newRow]?.length || 0)) {
          queue.push([newRow, newCol]);
        }
      }
    }

    return connected;
  };

  // Handle shooting
  const handleShoot = useCallback(() => {
    if (!currentBubble || shootingBubble || gameState !== 'playing') return;

    const config = getLevelConfig();
    const radians = (aimAngle * Math.PI) / 180;
    
    setShootingBubble({
      id: bubbleIdRef.current++,
      x: 50,
      y: 85,
      type: currentBubble.type,
      emoji: currentBubble.emoji,
      color: currentBubble.color,
      vx: Math.cos(radians) * config.shooterSpeed * 0.5,
      vy: -Math.sin(radians) * config.shooterSpeed * 0.5,
    });

    if (soundEnabled) playPop();
    setCurrentBubble(nextBubble);
    setNextBubble(getRandomBubble());
  }, [currentBubble, nextBubble, shootingBubble, aimAngle, gameState, soundEnabled, playPop]);

  // Update shooting bubble position
  useEffect(() => {
    if (!shootingBubble || gameState !== 'playing') return;

    const interval = setInterval(() => {
      setShootingBubble(prev => {
        if (!prev) return null;

        let newX = prev.x + prev.vx;
        let newY = prev.y + prev.vy;
        let newVx = prev.vx;

        // Bounce off walls
        if (newX <= 5 || newX >= 95) {
          newVx = -newVx;
          newX = Math.max(5, Math.min(95, newX));
        }

        // Check if hit top
        if (newY <= 15) {
          addBubbleToGrid(prev, 0, Math.round(newX / 12.5));
          return null;
        }

        // Check collision with grid bubbles
        for (let row = 0; row < grid.length; row++) {
          for (let col = 0; col < (grid[row]?.length || 0); col++) {
            const cell = grid[row]?.[col];
            if (!cell) continue;

            const pos = getCellPosition(row, col);
            const dx = (newX / 100) * (gameAreaRef.current?.offsetWidth || 400) - pos.x;
            const dy = (newY / 100) * (gameAreaRef.current?.offsetHeight || 600) - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CELL_SIZE * 0.9) {
              // Find best empty neighbor
              const isEvenRow = row % 2 === 0;
              const neighbors = isEvenRow
                ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
                : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];

              for (const [dr, dc] of neighbors) {
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && (!grid[newRow] || !grid[newRow][newCol])) {
                  addBubbleToGrid(prev, newRow, newCol);
                  return null;
                }
              }

              addBubbleToGrid(prev, row + 1, col);
              return null;
            }
          }
        }

        return { ...prev, x: newX, y: newY, vx: newVx };
      });
    }, 30);

    return () => clearInterval(interval);
  }, [shootingBubble, gameState, grid]);

  const addBubbleToGrid = (bubble: ShootingBubble, row: number, col: number) => {
    setGrid(prev => {
      const newGrid = prev.map(r => [...r]);
      
      // Ensure row exists
      while (newGrid.length <= row) {
        const numCols = newGrid.length % 2 === 0 ? COLS : COLS - 1;
        newGrid.push(Array(numCols).fill(null));
      }

      // Ensure column is valid
      const maxCols = row % 2 === 0 ? COLS : COLS - 1;
      const safeCol = Math.max(0, Math.min(col, maxCols - 1));

      // Add the new bubble
      const newCell: GridCell = {
        id: bubble.id,
        row,
        col: safeCol,
        type: bubble.type,
        emoji: bubble.emoji,
        color: bubble.color,
        popping: false,
      };

      newGrid[row][safeCol] = newCell;

      // Check for matches (3+ connected)
      const connected = findConnectedCells(newGrid, row, safeCol, bubble.type);

      if (connected.size >= 3) {
        // Pop connected cells
        const points = connected.size * 10 * (combo + 1);
        setScore(s => s + points);
        setCombo(c => c + 1);

        if (soundEnabled) playMatch();

        // Trigger confetti for big matches
        if (connected.size >= 4) {
          confetti({
            particleCount: connected.size * 15,
            spread: 50,
            origin: { y: 0.3 },
          });
        }

        // Mark cells for popping and remove after animation
        connected.forEach(key => {
          const [r, c] = key.split(',').map(Number);
          if (newGrid[r]?.[c]) {
            newGrid[r][c] = { ...newGrid[r][c]!, popping: true };
          }
        });

        setTimeout(() => {
          setGrid(g => {
            return g.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                if (cell && connected.has(`${rIdx},${cIdx}`)) {
                  return null;
                }
                return cell;
              })
            );
          });
        }, 300);
      } else {
        setCombo(0);
      }

      return newGrid;
    });
  };

  // Handle aim
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!gameAreaRef.current || gameState !== 'playing') return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const shooterX = rect.left + rect.width / 2;
    const shooterY = rect.top + rect.height * 0.85;

    const dx = clientX - shooterX;
    const dy = shooterY - clientY;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = Math.max(20, Math.min(160, angle));
    
    setAimAngle(angle);
  };

  const finishGame = async () => {
    setGameState('finished');
    setIsSaving(true);

    const config = getLevelConfig();
    const won = score >= config.targetScore;
    setLevelWon(won);
    
    const pointsEarned = Math.floor(score / 10);

    if (won && soundEnabled) {
      playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

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

  const goToNextLevel = () => {
    if (selectedLevel < 5) {
      setSelectedLevel(selectedLevel + 1);
      setTimeout(() => startGame(), 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-200 to-blue-200">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl"
        >
          🎯
        </motion.div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="trash-shooter"
        gameTitle="Eco Bubble Pop 🎯"
        gameDescription="Match 3+ same items to pop them!"
        gameIcon={<Target className="w-6 h-6 text-orange-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-200 overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-30"
            style={{ 
              left: `${10 + i * 12}%`,
              top: '-5%',
            }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
            transition={{
              duration: 20 + i * 3,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          >
            {SHOOTER_ITEMS[i % SHOOTER_ITEMS.length].emoji}
          </motion.div>
        ))}
      </div>

      {/* Level Unlock Animation */}
      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-green-200 fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setGameState('menu')} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-green-800 flex items-center gap-2">
                  🎯 Eco Bubble Pop
                </h1>
                <p className="text-xs text-green-600">Level {selectedLevel} • Target: {config.targetScore}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {combo > 1 && (
                <motion.div
                  key={combo}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-orange-500 text-white px-3 py-1 rounded-full font-bold"
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  {combo}x!
                </motion.div>
              )}
              <div className="bg-yellow-100 px-4 py-2 rounded-full">
                <span className="font-bold text-yellow-700">⭐ {score}</span>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${
                timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'
              }`}>
                ⏱️ {timeLeft}s
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game Area */}
      {gameState === 'playing' && (
        <div 
          ref={gameAreaRef}
          className="h-screen pt-20 relative"
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          onClick={handleShoot}
          style={{ touchAction: 'none' }}
        >
          {/* Grid bubbles */}
          {grid.map((row, rowIdx) => 
            row.map((cell, colIdx) => {
              if (!cell) return null;
              const pos = getCellPosition(rowIdx, colIdx);
              
              return (
                <motion.div
                  key={cell.id}
                  className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg ${cell.color}`}
                  style={{ 
                    left: pos.x,
                    top: pos.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: cell.popping ? [1, 1.3, 0] : 1,
                    opacity: cell.popping ? [1, 1, 0] : 1,
                  }}
                  transition={{ duration: cell.popping ? 0.3 : 0.2 }}
                >
                  {cell.emoji}
                </motion.div>
              );
            })
          )}

          {/* Shooting bubble */}
          <AnimatePresence>
            {shootingBubble && (
              <motion.div
                className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-xl ${shootingBubble.color}`}
                style={{ 
                  left: `${shootingBubble.x}%`, 
                  top: `${shootingBubble.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
              >
                {shootingBubble.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Aim line */}
          {!shootingBubble && (
            <div 
              className="absolute bottom-[15%] left-1/2 origin-bottom"
              style={{ 
                transform: `translateX(-50%) rotate(${90 - aimAngle}deg)`,
                width: '3px',
                height: '100px',
                background: 'linear-gradient(to top, rgba(34, 197, 94, 0.8), transparent)',
              }}
            />
          )}

          {/* Shooter */}
          <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            {/* Current bubble */}
            {currentBubble && !shootingBubble && (
              <motion.div 
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-xl ${currentBubble.color} cursor-pointer`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {currentBubble.emoji}
              </motion.div>
            )}
            
            {/* Next bubble indicator */}
            {nextBubble && (
              <div className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full">
                <span className="text-sm text-gray-600 font-medium">Next:</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xl ${nextBubble.color}`}>
                  {nextBubble.emoji}
                </div>
              </div>
            )}
          </div>

          {/* Tap to shoot hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
            <p className="text-gray-600 font-medium bg-white/80 px-4 py-2 rounded-full">👆 Aim & Tap to shoot!</p>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'finished' && (
        <div className="min-h-screen pt-20 flex items-center justify-center px-4 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <motion.div 
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: levelWon ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.5, repeat: levelWon ? 3 : 0 }}
            >
              {levelWon ? '🎉' : '😊'}
            </motion.div>

            <h2 className="font-display font-bold text-3xl text-gray-800 mb-2">
              {levelWon ? 'Amazing!' : 'Good Try!'}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {levelWon ? 'You matched them all! 🌟' : `Target was ${config.targetScore} points!`}
            </p>

            <div className="bg-yellow-100 rounded-2xl p-6 mb-6">
              <p className="text-sm text-yellow-700">Your Score</p>
              <p className="font-bold text-5xl text-yellow-600">{score}</p>
              <p className="text-sm text-yellow-700 mt-2">+{Math.floor(score / 10)} points earned ⭐</p>
            </div>

            {isSaving ? (
              <p className="text-gray-500">Saving progress... 🎯</p>
            ) : (
              <div className="flex flex-col gap-3">
                {levelWon && selectedLevel < 5 && (
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
                  <Button onClick={startGame} className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <RotateCcw className="w-5 h-5 mr-2" />
                    {levelWon ? 'Replay' : 'Try Again!'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
