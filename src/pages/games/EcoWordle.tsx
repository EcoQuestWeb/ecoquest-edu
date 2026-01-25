import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Type, RotateCcw, Volume2, VolumeX, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import { useGameSounds } from '@/hooks/useGameSounds';
import confetti from 'canvas-confetti';

// Eco-themed words organized by difficulty
const WORDS_BY_LEVEL: Record<number, { words: string[], hints: Record<string, string> }> = {
  1: { 
    words: ['EARTH', 'WATER', 'TREES', 'PLANT', 'GREEN', 'CLEAN', 'SOLAR', 'OCEAN'],
    hints: {
      'EARTH': '🌍 Our home planet!',
      'WATER': '💧 We drink this!',
      'TREES': '🌳 They give us oxygen!',
      'PLANT': '🌱 It grows from seeds!',
      'GREEN': '💚 Color of leaves!',
      'CLEAN': '✨ Not dirty!',
      'SOLAR': '☀️ Power from the sun!',
      'OCEAN': '🌊 Big blue water!'
    }
  },
  2: { 
    words: ['FLORA', 'FAUNA', 'CORAL', 'OZONE', 'BIOME', 'CYCLE', 'WASTE', 'REUSE'],
    hints: {
      'FLORA': '🌸 All plant life!',
      'FAUNA': '🦁 All animal life!',
      'CORAL': '🪸 Underwater rainbow!',
      'OZONE': '🛡️ Protects us from sun!',
      'BIOME': '🏔️ A natural area!',
      'CYCLE': '🔄 Goes round and round!',
      'WASTE': '🗑️ Throw away stuff!',
      'REUSE': '♻️ Use again!'
    }
  },
  3: { 
    words: ['POLAR', 'ALGAE', 'RIVER', 'MARSH', 'CLOUD', 'WINDS', 'STORM', 'FROST'],
    hints: {
      'POLAR': '🐻‍❄️ Very cold areas!',
      'ALGAE': '🌿 Green water plants!',
      'RIVER': '🏞️ Flowing water!',
      'MARSH': '🦆 Wet muddy land!',
      'CLOUD': '☁️ Fluffy in the sky!',
      'WINDS': '💨 Moving air!',
      'STORM': '⛈️ Lots of rain and thunder!',
      'FROST': '❄️ Ice crystals!'
    }
  },
  4: { 
    words: ['BLOOM', 'GRAIN', 'SEEDS', 'ROOTS', 'SHORE', 'CAVES', 'PEAKS', 'DELTA'],
    hints: {
      'BLOOM': '🌺 Flowers opening!',
      'GRAIN': '🌾 Tiny food pieces!',
      'SEEDS': '🌻 Baby plants!',
      'ROOTS': '🌿 Underground parts!',
      'SHORE': '🏖️ Beach edge!',
      'CAVES': '🦇 Underground rooms!',
      'PEAKS': '⛰️ Mountain tops!',
      'DELTA': '🏝️ River meets ocean!'
    }
  },
  5: { 
    words: ['HYDRO', 'FUNGI', 'XYLEM', 'GLADE', 'BASIN', 'CREST', 'HEATH', 'TROVE'],
    hints: {
      'HYDRO': '💧 Water power!',
      'FUNGI': '🍄 Mushrooms family!',
      'XYLEM': '🌲 Plant water pipes!',
      'GLADE': '🌲 Forest clearing!',
      'BASIN': '🏞️ Low land area!',
      'CREST': '🌊 Top of a wave!',
      'HEATH': '🌿 Wild open land!',
      'TROVE': '💎 Hidden treasure!'
    }
  },
};

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface LevelConfig {
  level: number;
  maxGuesses: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, maxGuesses: 6 },
  { level: 2, maxGuesses: 6 },
  { level: 3, maxGuesses: 5 },
  { level: 4, maxGuesses: 5 },
  { level: 5, maxGuesses: 4 },
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function EcoWordle() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playSuccess, playError, playPop, playFanfare } = useGameSounds();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [targetWord, setTargetWord] = useState('');
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [revealingRow, setRevealingRow] = useState(-1);

  const usedWordsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];
  const getLevelData = () => WORDS_BY_LEVEL[selectedLevel] || WORDS_BY_LEVEL[1];

  const startGame = () => {
    const levelData = getLevelData();
    const available = levelData.words.filter(w => !usedWordsRef.current.has(w));
    const shuffled = available.length > 0 ? shuffleArray(available) : shuffleArray([...levelData.words]);
    
    const word = shuffled[0];
    usedWordsRef.current.add(word);
    
    setTargetWord(word);
    setHint(levelData.hints[word] || '');
    setGuesses([]);
    setCurrentGuess('');
    setLetterStatuses({});
    setShowHint(false);
    setRevealingRow(-1);
    setGameState('playing');
  };

  const getLetterStatus = (letter: string, index: number): LetterStatus => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const submitGuess = useCallback(async () => {
    const config = getLevelConfig();
    if (currentGuess.length !== 5 || gameState !== 'playing') return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setRevealingRow(newGuesses.length - 1);

    // Play pop sounds for each letter reveal
    if (soundEnabled) {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => playPop(), i * 200);
      }
    }

    // Update letter statuses after reveal
    setTimeout(() => {
      const newStatuses = { ...letterStatuses };
      for (let i = 0; i < currentGuess.length; i++) {
        const letter = currentGuess[i];
        const status = getLetterStatus(letter, i);
        if (!newStatuses[letter] || status === 'correct' || (status === 'present' && newStatuses[letter] === 'absent')) {
          newStatuses[letter] = status;
        }
      }
      setLetterStatuses(newStatuses);
      setCurrentGuess('');
      setRevealingRow(-1);

      // Check win/lose
      if (currentGuess === targetWord) {
        setGameState('won');
        if (soundEnabled) {
          playFanfare();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#10b981', '#34d399', '#fbbf24'],
          });
        }
        setIsSaving(true);
        const pointsEarned = Math.max(5, 30 - (newGuesses.length - 1) * 5);
        completeGame('eco-wordle', pointsEarned).then(() => {
          completeLevel('eco-wordle', selectedLevel, pointsEarned);
          if (selectedLevel < 5) {
            setShowUnlockAnimation(true);
          }
          setIsSaving(false);
        });
      } else if (newGuesses.length >= config.maxGuesses) {
        setGameState('lost');
        if (soundEnabled) playError();
        setIsSaving(true);
        completeGame('eco-wordle', 2).then(() => {
          setIsSaving(false);
        });
      }
    }, 1200);
  }, [currentGuess, guesses, gameState, targetWord, letterStatuses, completeGame, selectedLevel, completeLevel, soundEnabled, playPop, playFanfare, playError]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing' || revealingRow >= 0) return;

    if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        submitGuess();
      }
    } else if (key === 'DEL') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
      if (soundEnabled) playPop();
    }
  }, [currentGuess, gameState, submitGuess, revealingRow, soundEnabled, playPop]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('DEL');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, gameState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-200 to-blue-200">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
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
        gameName="eco-wordle"
        gameTitle="Eco Word Search 🔤"
        gameDescription="Find the hidden eco-word!"
        gameIcon={<Type className="w-6 h-6 text-eco-earth" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < config.maxGuesses; i++) {
      const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
      const isSubmitted = i < guesses.length;
      const isRevealing = i === revealingRow;
      
      rows.push(
        <div key={i} className="flex gap-2 justify-center">
          {Array.from({ length: 5 }).map((_, j) => {
            const letter = guess[j] || '';
            let bgColor = 'bg-white border-4 border-gray-200';
            let textColor = 'text-gray-800';
            
            if (isSubmitted && letter && !isRevealing) {
              const status = getLetterStatus(letter, j);
              if (status === 'correct') {
                bgColor = 'bg-gradient-to-br from-green-400 to-green-600 border-green-600';
                textColor = 'text-white';
              } else if (status === 'present') {
                bgColor = 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-500';
                textColor = 'text-white';
              } else {
                bgColor = 'bg-gray-400 border-gray-500';
                textColor = 'text-white';
              }
            }

            return (
              <motion.div
                key={j}
                className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center font-bold text-2xl sm:text-3xl rounded-xl ${bgColor} ${textColor} shadow-lg ${
                  letter && !isSubmitted ? 'border-green-400 scale-105' : ''
                }`}
                initial={letter && !isSubmitted ? { scale: 0.8 } : undefined}
                animate={{ 
                  scale: 1,
                  rotateX: isRevealing ? [0, 90, 0] : 0,
                }}
                transition={{ 
                  rotateX: { duration: 0.4, delay: j * 0.2 },
                }}
              >
                {letter}
              </motion.div>
            );
          })}
        </div>
      );
    }
    return rows;
  };

  const getKeyColor = (key: string) => {
    const status = letterStatuses[key];
    if (status === 'correct') return 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg';
    if (status === 'present') return 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg';
    if (status === 'absent') return 'bg-gray-400 text-white';
    return 'bg-white hover:bg-gray-100 shadow-md';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-200 via-blue-100 to-green-100">
      {/* Decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{ 
              left: `${10 + i * 15}%`,
              top: '-5%',
            }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 2,
            }}
          >
            {['🍃', '🌸', '🌺', '🦋', '🌻', '🌿'][i]}
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
                  🔤 Eco Word Search
                </h1>
                <p className="text-xs text-green-600">Level {selectedLevel} • {config.maxGuesses} guesses</p>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="rounded-full gap-1"
              >
                <Sparkles className="w-4 h-4" />
                Hint
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6 relative z-10">
        <div className="max-w-md mx-auto space-y-4">
          {/* Hint */}
          <AnimatePresence>
            {showHint && hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-yellow-100 rounded-2xl p-4 text-center border-2 border-yellow-300"
              >
                <p className="text-lg font-medium text-yellow-800">{hint}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          <div className="space-y-2 py-4">
            {renderGrid()}
          </div>

          {/* Game Over Message */}
          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div 
              className={`bg-white/95 backdrop-blur-sm rounded-3xl p-6 text-center shadow-2xl border-4 ${
                gameState === 'won' ? 'border-green-400' : 'border-orange-300'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: gameState === 'won' ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5, repeat: gameState === 'won' ? 3 : 0 }}
              >
                {gameState === 'won' ? '🎉' : '🤔'}
              </motion.div>
              
              <h2 className="font-display font-bold text-2xl mb-2 text-gray-800">
                {gameState === 'won' ? 'Amazing!' : `The word was: ${targetWord}`}
              </h2>
              
              {gameState === 'won' && (
                <div className="flex justify-center gap-1 mb-4">
                  {[...Array(Math.max(1, 6 - guesses.length))].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    </motion.span>
                  ))}
                </div>
              )}
              
              <div className="bg-green-100 rounded-2xl p-4 mb-4">
                <p className="text-sm text-green-600">Points Earned</p>
                <p className="font-bold text-3xl text-green-700">
                  +{gameState === 'won' ? Math.max(5, 30 - (guesses.length - 1) * 5) : 2} ⭐
                </p>
              </div>

              {isSaving ? (
                <p className="text-gray-500">Saving...</p>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1 py-5 rounded-2xl">
                    🏠 Menu
                  </Button>
                  <Button onClick={startGame} className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {gameState === 'won' ? 'Next Word!' : 'Try Again!'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Keyboard */}
          {gameState === 'playing' && (
            <div className="space-y-2 pt-4">
              {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="flex justify-center gap-1.5">
                  {row.map(key => (
                    <motion.button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`${
                        key === 'ENTER' || key === 'DEL' ? 'px-3 text-sm' : 'w-9 sm:w-10'
                      } h-12 sm:h-14 rounded-xl font-bold ${getKeyColor(key)} transition-all`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {key === 'DEL' ? '⌫' : key === 'ENTER' ? '✓' : key}
                    </motion.button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
