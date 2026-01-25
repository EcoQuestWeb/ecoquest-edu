import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { ArrowLeft, Recycle, Check, X, RotateCcw, Trophy, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import { useGameSounds } from '@/hooks/useGameSounds';
import { AnimatedBackground } from '@/components/game/AnimatedBackground';
import confetti from 'canvas-confetti';

// Big colorful waste items with fun names
const ALL_WASTE_ITEMS = [
  { id: 1, name: 'Plastic Bottle', correctBin: 'plastic', emoji: '🧴', size: 'text-7xl' },
  { id: 2, name: 'Newspaper', correctBin: 'paper', emoji: '📰', size: 'text-7xl' },
  { id: 3, name: 'Apple Core', correctBin: 'organic', emoji: '🍎', size: 'text-7xl' },
  { id: 4, name: 'Glass Jar', correctBin: 'glass', emoji: '🫙', size: 'text-6xl' },
  { id: 5, name: 'Cardboard Box', correctBin: 'paper', emoji: '📦', size: 'text-7xl' },
  { id: 6, name: 'Banana Peel', correctBin: 'organic', emoji: '🍌', size: 'text-7xl' },
  { id: 7, name: 'Soda Can', correctBin: 'metal', emoji: '🥫', size: 'text-6xl' },
  { id: 8, name: 'Milk Carton', correctBin: 'paper', emoji: '🥛', size: 'text-7xl' },
  { id: 9, name: 'Egg Shells', correctBin: 'organic', emoji: '🥚', size: 'text-6xl' },
  { id: 10, name: 'Shopping Bag', correctBin: 'plastic', emoji: '🛍️', size: 'text-7xl' },
  { id: 11, name: 'Coffee Grounds', correctBin: 'organic', emoji: '☕', size: 'text-6xl' },
  { id: 12, name: 'Wine Bottle', correctBin: 'glass', emoji: '🍾', size: 'text-7xl' },
  { id: 13, name: 'Tin Foil', correctBin: 'metal', emoji: '🔲', size: 'text-5xl' },
  { id: 14, name: 'Magazine', correctBin: 'paper', emoji: '📖', size: 'text-6xl' },
  { id: 15, name: 'Yogurt Cup', correctBin: 'plastic', emoji: '🥛', size: 'text-6xl' },
  { id: 16, name: 'Tea Bags', correctBin: 'organic', emoji: '🍵', size: 'text-6xl' },
  { id: 17, name: 'Light Bulb', correctBin: 'glass', emoji: '💡', size: 'text-6xl' },
  { id: 18, name: 'Food Can', correctBin: 'metal', emoji: '🥫', size: 'text-6xl' },
  { id: 19, name: 'Candy Wrapper', correctBin: 'plastic', emoji: '🍬', size: 'text-7xl' },
  { id: 20, name: 'Orange Peel', correctBin: 'organic', emoji: '🍊', size: 'text-7xl' },
  { id: 21, name: 'Broken Plate', correctBin: 'glass', emoji: '🍽️', size: 'text-6xl' },
  { id: 22, name: 'Paper Towel', correctBin: 'organic', emoji: '🧻', size: 'text-6xl' },
  { id: 23, name: 'Metal Lid', correctBin: 'metal', emoji: '🔘', size: 'text-5xl' },
  { id: 24, name: 'Cereal Box', correctBin: 'paper', emoji: '🥣', size: 'text-6xl' },
  { id: 25, name: 'Shampoo Bottle', correctBin: 'plastic', emoji: '🧴', size: 'text-7xl' },
];

// Colorful animated bins
const BINS = [
  { id: 'plastic', name: 'Plastic', color: 'from-blue-400 to-blue-600', emoji: '♻️', bgColor: 'bg-blue-500' },
  { id: 'paper', name: 'Paper', color: 'from-yellow-400 to-yellow-600', emoji: '📄', bgColor: 'bg-yellow-500' },
  { id: 'organic', name: 'Organic', color: 'from-green-400 to-green-600', emoji: '🌱', bgColor: 'bg-green-500' },
  { id: 'glass', name: 'Glass', color: 'from-purple-400 to-purple-600', emoji: '🔮', bgColor: 'bg-purple-500' },
  { id: 'metal', name: 'Metal', color: 'from-gray-400 to-gray-600', emoji: '🔧', bgColor: 'bg-gray-500' },
];

interface LevelConfig {
  level: number;
  itemCount: number;
  timeLimit: number;
  targetScore: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, itemCount: 5, timeLimit: 60, targetScore: 30 },
  { level: 2, itemCount: 7, timeLimit: 50, targetScore: 50 },
  { level: 3, itemCount: 10, timeLimit: 45, targetScore: 80 },
  { level: 4, itemCount: 12, timeLimit: 40, targetScore: 100 },
  { level: 5, itemCount: 15, timeLimit: 35, targetScore: 130 },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function WasteSorting() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playSuccess, playError, playFanfare } = useGameSounds();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [items, setItems] = useState<typeof ALL_WASTE_ITEMS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string; bin: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [draggedOver, setDraggedOver] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const usedItemsRef = useRef<Set<number>>(new Set());
  const binsRef = useRef<Map<string, DOMRect>>(new Map());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    usedItemsRef.current.clear();
    
    const shuffled = shuffleArray([...ALL_WASTE_ITEMS]);
    const levelItems = shuffled.slice(0, config.itemCount);
    
    setItems(levelItems);
    setCurrentIndex(0);
    setScore(0);
    setWrongAnswers(0);
    setTimeLeft(config.timeLimit);
    setFeedback(null);
    setGameState('playing');
  };

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishGame(score, false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score]);

  const currentItem = items[currentIndex];

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    if (!currentItem || feedback) return;

    // Find which bin was dropped on
    const dropPoint = { x: info.point.x, y: info.point.y };
    
    for (const [binId, rect] of binsRef.current.entries()) {
      if (
        dropPoint.x >= rect.left &&
        dropPoint.x <= rect.right &&
        dropPoint.y >= rect.top &&
        dropPoint.y <= rect.bottom
      ) {
        handleBinSelect(binId);
        return;
      }
    }
    setDraggedOver(null);
  };

  const handleBinSelect = (binId: string) => {
    if (!currentItem || feedback) return;

    const isCorrect = currentItem.correctBin === binId;
    const correctBin = BINS.find(b => b.id === currentItem.correctBin);
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback({ correct: true, message: 'Great job! 🎉', bin: binId });
      if (soundEnabled) {
        playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#22c55e', '#10b981', '#34d399'],
        });
      }
    } else {
      setWrongAnswers(prev => prev + 1);
      setFeedback({ correct: false, message: `Oops! Try ${correctBin?.emoji} ${correctBin?.name}!`, bin: binId });
      if (soundEnabled) playError();
    }

    setTimeout(() => {
      setFeedback(null);
      setDraggedOver(null);
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishGame(isCorrect ? score + 10 : score, true);
      }
    }, 1200);
  };

  const finishGame = async (finalScore: number, completed: boolean) => {
    setGameState('finished');
    setIsSaving(true);
    
    const config = getLevelConfig();
    const won = finalScore >= config.targetScore && completed;
    const pointsEarned = Math.floor(finalScore / 10) * 2;
    
    if (won && soundEnabled) {
      playFanfare();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    
    if (pointsEarned > 0) {
      await completeGame('waste-sorting', pointsEarned);
      
      if (won) {
        completeLevel('waste-sorting', selectedLevel, pointsEarned);
        if (selectedLevel < 5) {
          setShowUnlockAnimation(true);
        }
      }
    }
    
    setIsSaving(false);
  };

  // Update bin positions for drag detection
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const updateBinPositions = () => {
      BINS.forEach(bin => {
        const el = document.getElementById(`bin-${bin.id}`);
        if (el) {
          binsRef.current.set(bin.id, el.getBoundingClientRect());
        }
      });
    };
    
    updateBinPositions();
    window.addEventListener('resize', updateBinPositions);
    return () => window.removeEventListener('resize', updateBinPositions);
  }, [gameState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <motion.div 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl"
        >
          🌍
        </motion.div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="waste-sorting"
        gameTitle="Waste Sorting ♻️"
        gameDescription="Drag trash to the right bin!"
        gameIcon={<Recycle className="w-6 h-6 text-eco-leaf" />}
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
    <div className="min-h-screen overflow-hidden relative">
      <AnimatedBackground type="nature" />
      
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
                  ♻️ Waste Sorting
                </h1>
                <p className="text-xs text-green-600">Level {selectedLevel} • Target: {config.targetScore} pts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-full"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <div className={`px-4 py-2 rounded-full font-bold text-lg ${
                timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'
              }`}>
                ⏱️ {timeLeft}s
              </div>
              <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-700 text-lg">{score}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8 relative z-10">
        {gameState === 'playing' && currentItem ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2">
              {items.map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < currentIndex ? 'bg-green-500' : 
                    i === currentIndex ? 'bg-green-400 ring-4 ring-green-200' : 'bg-gray-200'
                  }`}
                  initial={i === currentIndex ? { scale: 0 } : undefined}
                  animate={{ scale: 1 }}
                />
              ))}
            </div>

            {/* Current Item - Draggable */}
            <div className="flex justify-center py-8">
              <motion.div
                drag
                dragSnapToOrigin
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.1, zIndex: 100 }}
                className={`bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl cursor-grab active:cursor-grabbing ${
                  isDragging ? 'shadow-3xl' : ''
                }`}
                style={{ touchAction: 'none' }}
              >
                <AnimatePresence>
                  {feedback && (
                    <motion.div 
                      className={`absolute inset-0 flex items-center justify-center z-10 rounded-3xl ${
                        feedback.correct ? 'bg-green-500/95' : 'bg-red-400/95'
                      }`}
                      initial={{ scale: 0, borderRadius: '100%' }}
                      animate={{ scale: 1, borderRadius: '24px' }}
                      exit={{ scale: 0 }}
                    >
                      <div className="text-white text-center p-4">
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], rotate: feedback.correct ? [0, 10, -10, 0] : [0, -5, 5, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                          className="text-6xl mb-2"
                        >
                          {feedback.correct ? '✅' : '❌'}
                        </motion.div>
                        <p className="font-bold text-xl">{feedback.message}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div 
                  className={currentItem.size}
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: isDragging ? [0, -5, 5, 0] : 0,
                  }}
                  transition={{ 
                    y: { duration: 1.5, repeat: Infinity },
                    rotate: { duration: 0.3, repeat: Infinity },
                  }}
                >
                  {currentItem.emoji}
                </motion.div>
                <p className="text-center mt-4 font-bold text-xl text-gray-700">
                  {currentItem.name}
                </p>
                <p className="text-center text-sm text-gray-500 mt-1">
                  👆 Drag to the right bin!
                </p>
              </motion.div>
            </div>

            {/* Bins */}
            <div className="grid grid-cols-5 gap-3">
              {BINS.map(bin => (
                <motion.button
                  id={`bin-${bin.id}`}
                  key={bin.id}
                  onClick={() => handleBinSelect(bin.id)}
                  disabled={!!feedback}
                  className={`bg-gradient-to-b ${bin.color} p-4 rounded-2xl text-white text-center transition-all shadow-lg
                    ${draggedOver === bin.id ? 'ring-4 ring-white scale-110' : ''}
                    ${feedback?.bin === bin.id ? (feedback.correct ? 'ring-4 ring-green-300' : 'ring-4 ring-red-300 animate-shake') : ''}
                  `}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  animate={feedback?.bin === bin.id && feedback.correct ? { y: [0, -20, 0] } : {}}
                >
                  <motion.div 
                    className="text-4xl mb-2"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: BINS.indexOf(bin) * 0.2 }}
                  >
                    {bin.emoji}
                  </motion.div>
                  <p className="text-sm font-bold">{bin.name}</p>
                  
                  {/* Bin opening animation */}
                  <motion.div
                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-white/30 rounded-full"
                    animate={{ scaleX: draggedOver === bin.id ? 1.5 : 1 }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Fun tip */}
            <motion.div 
              className="text-center text-gray-600 bg-white/80 rounded-2xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-2xl mr-2">💡</span>
              <span className="font-medium">Tip: You can also tap the bins!</span>
            </motion.div>
          </div>
        ) : gameState === 'finished' && (
          <motion.div 
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto text-center shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
          >
            <motion.div 
              className="text-8xl mb-6"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: won ? [0, -10, 10, -10, 0] : 0,
              }}
              transition={{ duration: 0.5, repeat: won ? 3 : 0 }}
            >
              {won ? '🎉' : '😢'}
            </motion.div>

            <h2 className="font-display font-bold text-3xl text-gray-800 mb-2">
              {won ? 'Amazing!' : 'Keep Trying!'}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {won ? 'You\'re a recycling superstar! 🌟' : `You need ${config.targetScore} points to win!`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 rounded-2xl p-4">
                <p className="text-4xl font-bold text-green-600">{score / 10}</p>
                <p className="text-sm text-green-700">Correct ✅</p>
              </div>
              <div className="bg-red-100 rounded-2xl p-4">
                <p className="text-4xl font-bold text-red-500">{wrongAnswers}</p>
                <p className="text-sm text-red-600">Wrong ❌</p>
              </div>
            </div>

            <div className="bg-yellow-100 rounded-2xl p-4 mb-6">
              <p className="text-sm text-yellow-700">Points Earned</p>
              <p className="font-bold text-3xl text-yellow-600">+{Math.floor(score / 10) * 2} ⭐</p>
            </div>

            {isSaving ? (
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-2xl"
                >
                  ♻️
                </motion.div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setGameState('menu')} 
                  className="flex-1 py-6 text-lg rounded-2xl"
                >
                  🏠 Menu
                </Button>
                <Button 
                  onClick={startGame} 
                  className="flex-1 py-6 text-lg rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  {won ? 'Play Again!' : 'Try Again!'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
