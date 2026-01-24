import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Recycle, Check, X, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';

const ALL_WASTE_ITEMS = [
  { id: 1, name: 'Plastic Bottle', correctBin: 'plastic', emoji: '🧴' },
  { id: 2, name: 'Newspaper', correctBin: 'paper', emoji: '📰' },
  { id: 3, name: 'Apple Core', correctBin: 'organic', emoji: '🍎' },
  { id: 4, name: 'Glass Jar', correctBin: 'glass', emoji: '🫙' },
  { id: 5, name: 'Cardboard Box', correctBin: 'paper', emoji: '📦' },
  { id: 6, name: 'Banana Peel', correctBin: 'organic', emoji: '🍌' },
  { id: 7, name: 'Soda Can', correctBin: 'metal', emoji: '🥫' },
  { id: 8, name: 'Milk Carton', correctBin: 'paper', emoji: '🥛' },
  { id: 9, name: 'Egg Shells', correctBin: 'organic', emoji: '🥚' },
  { id: 10, name: 'Plastic Bag', correctBin: 'plastic', emoji: '🛍️' },
  { id: 11, name: 'Coffee Grounds', correctBin: 'organic', emoji: '☕' },
  { id: 12, name: 'Wine Bottle', correctBin: 'glass', emoji: '🍾' },
  { id: 13, name: 'Aluminum Foil', correctBin: 'metal', emoji: '🔲' },
  { id: 14, name: 'Magazine', correctBin: 'paper', emoji: '📖' },
  { id: 15, name: 'Yogurt Container', correctBin: 'plastic', emoji: '🥛' },
  { id: 16, name: 'Tea Bags', correctBin: 'organic', emoji: '🍵' },
  { id: 17, name: 'Light Bulb', correctBin: 'glass', emoji: '💡' },
  { id: 18, name: 'Food Can', correctBin: 'metal', emoji: '🥫' },
  { id: 19, name: 'Plastic Wrapper', correctBin: 'plastic', emoji: '🎁' },
  { id: 20, name: 'Orange Peel', correctBin: 'organic', emoji: '🍊' },
  { id: 21, name: 'Broken Plate', correctBin: 'glass', emoji: '🍽️' },
  { id: 22, name: 'Paper Towel', correctBin: 'organic', emoji: '🧻' },
  { id: 23, name: 'Metal Lid', correctBin: 'metal', emoji: '🔘' },
  { id: 24, name: 'Cereal Box', correctBin: 'paper', emoji: '🥣' },
  { id: 25, name: 'Shampoo Bottle', correctBin: 'plastic', emoji: '🧴' },
];

const BINS = [
  { id: 'plastic', name: 'Plastic', color: 'bg-blue-500', emoji: '♻️' },
  { id: 'paper', name: 'Paper', color: 'bg-yellow-500', emoji: '📄' },
  { id: 'organic', name: 'Organic', color: 'bg-green-500', emoji: '🌱' },
  { id: 'glass', name: 'Glass', color: 'bg-purple-500', emoji: '🔮' },
  { id: 'metal', name: 'Metal', color: 'bg-gray-500', emoji: '🔧' },
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
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [items, setItems] = useState<typeof ALL_WASTE_ITEMS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const usedItemsRef = useRef<Set<number>>(new Set());

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

  const handleBinSelect = (binId: string) => {
    if (!currentItem || feedback) return;

    const isCorrect = currentItem.correctBin === binId;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      setFeedback({ correct: true, message: 'Correct! 🎉' });
    } else {
      setWrongAnswers(prev => prev + 1);
      const correctBin = BINS.find(b => b.id === currentItem.correctBin);
      setFeedback({ correct: false, message: `Wrong! It goes in ${correctBin?.name} 🤔` });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        finishGame(isCorrect ? score + 10 : score, true);
      }
    }, 1000);
  };

  const finishGame = async (finalScore: number, completed: boolean) => {
    setGameState('finished');
    setIsSaving(true);
    
    const config = getLevelConfig();
    const won = finalScore >= config.targetScore && completed;
    const pointsEarned = Math.floor(finalScore / 10) * 2;
    
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
        gameName="waste-sorting"
        gameTitle="Waste Sorting ♻️"
        gameDescription="Sort items into the correct recycling bins!"
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
    <div className="min-h-screen gradient-sky">
      {/* Level Unlock Animation */}
      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />

      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setGameState('menu')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg sm:text-xl text-foreground">
                  Waste Sorting - Level {selectedLevel}
                </h1>
                <p className="text-xs text-muted-foreground">Target: {config.targetScore} points</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full ${
                timeLeft <= 10 ? 'bg-destructive/20 text-destructive' : 'bg-muted'
              }`}>
                <span className="font-bold text-sm">{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2 bg-eco-sun/20 px-3 py-1 rounded-full">
                <Trophy className="w-4 h-4 text-eco-earth" />
                <span className="font-bold text-eco-earth">{score}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8">
        {gameState === 'playing' && currentItem ? (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
            {/* Progress */}
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <span>Item {currentIndex + 1} of {items.length}</span>
            </div>

            {/* Current Item */}
            <motion.div 
              className="eco-card text-center relative overflow-hidden"
              key={currentItem.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <AnimatePresence>
                {feedback && (
                  <motion.div 
                    className={`absolute inset-0 flex items-center justify-center z-10 ${
                      feedback.correct ? 'bg-eco-leaf/90' : 'bg-destructive/90'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <div className="text-white text-center">
                      {feedback.correct ? (
                        <Check className="w-16 h-16 mx-auto mb-2" />
                      ) : (
                        <X className="w-16 h-16 mx-auto mb-2" />
                      )}
                      <p className="font-bold text-lg">{feedback.message}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div 
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {currentItem.emoji}
              </motion.div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                {currentItem.name}
              </h2>
              <p className="text-muted-foreground">Which bin does this go in?</p>
            </motion.div>

            {/* Bins */}
            <div className="grid grid-cols-5 gap-2">
              {BINS.map(bin => (
                <motion.button
                  key={bin.id}
                  onClick={() => handleBinSelect(bin.id)}
                  disabled={!!feedback}
                  className={`${bin.color} p-3 rounded-xl text-white text-center transition-transform disabled:opacity-50`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-2xl mb-1">{bin.emoji}</div>
                  <p className="text-xs font-medium">{bin.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : gameState === 'finished' && (
          <motion.div 
            className="eco-card max-w-md mx-auto text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${
              won ? 'bg-eco-leaf/20' : 'bg-destructive/20'
            }`}>
              <span className="text-5xl">{won ? '🎉' : '😢'}</span>
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              {won ? 'Level Complete!' : 'Try Again!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {won ? 'Great job sorting waste!' : `You needed ${config.targetScore} points to pass.`}
            </p>

            <div className="space-y-4 my-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Final Score</p>
                <p className="font-bold text-3xl text-foreground">{score}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-eco-leaf/10 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="font-bold text-xl text-eco-forest">{score / 10}</p>
                </div>
                <div className="bg-destructive/10 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Wrong</p>
                  <p className="font-bold text-xl text-destructive">{wrongAnswers}</p>
                </div>
              </div>

              <div className="bg-eco-sun/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="font-bold text-2xl text-eco-earth">+{Math.floor(score / 10) * 2}</p>
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
                  {won ? 'Play Again' : 'Retry'}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
