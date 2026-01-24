import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Type, RotateCcw, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';

// Words organized by difficulty
const WORDS_BY_LEVEL = {
  1: ['EARTH', 'WATER', 'TREES', 'PLANT', 'GREEN', 'CLEAN', 'SOLAR', 'OCEAN'],
  2: ['FLORA', 'FAUNA', 'CORAL', 'OZONE', 'BIOME', 'CYCLE', 'WASTE', 'REUSE'],
  3: ['POLAR', 'ALGAE', 'RIVER', 'MARSH', 'CLOUD', 'WINDS', 'STORM', 'FROST'],
  4: ['BLOOM', 'GRAIN', 'SEEDS', 'ROOTS', 'SHORE', 'CAVES', 'PEAKS', 'DELTA'],
  5: ['HYDRO', 'FUNGI', 'XYLEM', 'PHYLA', 'GLADE', 'RAVINE', 'BASIN', 'CREST'],
};

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface LevelConfig {
  level: number;
  maxGuesses: number;
  words: string[];
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, maxGuesses: 6, words: WORDS_BY_LEVEL[1] },
  { level: 2, maxGuesses: 6, words: WORDS_BY_LEVEL[2] },
  { level: 3, maxGuesses: 5, words: WORDS_BY_LEVEL[3] },
  { level: 4, maxGuesses: 5, words: WORDS_BY_LEVEL[4] },
  { level: 5, maxGuesses: 4, words: WORDS_BY_LEVEL[5] },
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

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'won' | 'lost'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const usedWordsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    const available = config.words.filter(w => !usedWordsRef.current.has(w));
    const shuffled = available.length > 0 ? shuffleArray(available) : shuffleArray([...config.words]);
    
    const word = shuffled[0];
    usedWordsRef.current.add(word);
    
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    setLetterStatuses({});
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

    // Update letter statuses
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

    // Check win/lose
    if (currentGuess === targetWord) {
      setGameState('won');
      setIsSaving(true);
      const pointsEarned = Math.max(5, 30 - (newGuesses.length - 1) * 5);
      await completeGame('eco-wordle', pointsEarned);
      completeLevel('eco-wordle', selectedLevel, pointsEarned);
      
      if (selectedLevel < 5) {
        setShowUnlockAnimation(true);
      }
      setIsSaving(false);
    } else if (newGuesses.length >= config.maxGuesses) {
      setGameState('lost');
      setIsSaving(true);
      await completeGame('eco-wordle', 2);
      setIsSaving(false);
    }
  }, [currentGuess, guesses, gameState, targetWord, letterStatuses, completeGame, selectedLevel, completeLevel]);

  const handleKeyPress = useCallback((key: string) => {
    if (gameState !== 'playing') return;

    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'DEL') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameState, submitGuess]);

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
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="eco-wordle"
        gameTitle="Eco Wordle 🔤"
        gameDescription="Guess the hidden eco-word!"
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
      
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {Array.from({ length: 5 }).map((_, j) => {
            const letter = guess[j] || '';
            let bgColor = 'bg-card border-2 border-border';
            
            if (isSubmitted && letter) {
              const status = getLetterStatus(letter, j);
              if (status === 'correct') bgColor = 'bg-eco-leaf text-white border-eco-leaf';
              else if (status === 'present') bgColor = 'bg-eco-sun text-eco-earth border-eco-sun';
              else bgColor = 'bg-muted-foreground/30 text-foreground border-muted-foreground/30';
            }

            return (
              <motion.div
                key={j}
                className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-lg ${bgColor} ${
                  letter && !isSubmitted ? 'border-primary' : ''
                }`}
                initial={letter && !isSubmitted ? { scale: 0.8 } : undefined}
                animate={{ scale: 1 }}
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
    if (status === 'correct') return 'bg-eco-leaf text-white';
    if (status === 'present') return 'bg-eco-sun text-eco-earth';
    if (status === 'absent') return 'bg-muted-foreground/30 text-foreground';
    return 'bg-muted hover:bg-muted/80';
  };

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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setGameState('menu')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-foreground">
                Eco Wordle - Level {selectedLevel}
              </h1>
              <p className="text-xs text-muted-foreground">
                {config.maxGuesses} guesses allowed
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-6">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Grid */}
          <div className="space-y-1.5 animate-fade-in-up">
            {renderGrid()}
          </div>

          {/* Game Over Message */}
          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div 
              className={`eco-card text-center ${
                gameState === 'won' ? 'border-eco-leaf' : 'border-destructive'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h2 className="font-display font-bold text-xl mb-2">
                {gameState === 'won' ? '🎉 Level Complete!' : `The word was: ${targetWord}`}
              </h2>
              
              <div className="bg-eco-sun/20 rounded-xl p-4 mb-4">
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="font-bold text-2xl text-eco-earth">
                  +{gameState === 'won' ? Math.max(5, 30 - (guesses.length - 1) * 5) : 2}
                </p>
              </div>

              {isSaving ? (
                <p className="text-muted-foreground">Saving...</p>
              ) : (
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={startGame} className="flex-1 gradient-nature text-primary-foreground">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {gameState === 'won' ? 'Next' : 'Retry'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Keyboard */}
          {gameState === 'playing' && (
            <div className="space-y-1.5">
              {KEYBOARD_ROWS.map((row, i) => (
                <div key={i} className="flex justify-center gap-1">
                  {row.map(key => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className={`${
                        key === 'ENTER' || key === 'DEL' ? 'px-3' : 'w-8'
                      } h-12 rounded-lg font-medium text-sm ${getKeyColor(key)} transition-colors`}
                    >
                      {key === 'DEL' ? <Delete className="w-4 h-4 mx-auto" /> : key}
                    </button>
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
