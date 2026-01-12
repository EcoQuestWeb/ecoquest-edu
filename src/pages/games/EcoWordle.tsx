import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type, RotateCcw, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';

const ECO_WORDS = [
  'EARTH', 'OCEAN', 'SOLAR', 'GREEN', 'OZONE', 'PLANT', 'WATER', 'TREES',
  'CORAL', 'CLEAN', 'FAUNA', 'FLORA', 'BIOME', 'CYCLE', 'WASTE', 'REUSE',
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'],
];

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export default function EcoWordle() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();

  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [isSaving, setIsSaving] = useState(false);
  const [letterStatuses, setLetterStatuses] = useState<Record<string, LetterStatus>>({});

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setTargetWord(ECO_WORDS[Math.floor(Math.random() * ECO_WORDS.length)]);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setLetterStatuses({});
  };

  const getLetterStatus = (letter: string, index: number, word: string): LetterStatus => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const submitGuess = useCallback(async () => {
    if (currentGuess.length !== 5 || gameState !== 'playing') return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    // Update letter statuses
    const newStatuses = { ...letterStatuses };
    for (let i = 0; i < currentGuess.length; i++) {
      const letter = currentGuess[i];
      const status = getLetterStatus(letter, i, currentGuess);
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
      setIsSaving(false);
    } else if (newGuesses.length >= 6) {
      setGameState('lost');
      setIsSaving(true);
      await completeGame('eco-wordle', 2); // Participation points
      setIsSaving(false);
    }
  }, [currentGuess, guesses, gameState, targetWord, letterStatuses, completeGame]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKeyPress('ENTER');
      else if (e.key === 'Backspace') handleKeyPress('DEL');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toUpperCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  const renderGrid = () => {
    const rows = [];
    for (let i = 0; i < 6; i++) {
      const guess = guesses[i] || (i === guesses.length ? currentGuess : '');
      const isSubmitted = i < guesses.length;
      
      rows.push(
        <div key={i} className="flex gap-1.5 justify-center">
          {Array.from({ length: 5 }).map((_, j) => {
            const letter = guess[j] || '';
            let bgColor = 'bg-card border-2 border-border';
            
            if (isSubmitted && letter) {
              const status = getLetterStatus(letter, j, guess);
              if (status === 'correct') bgColor = 'bg-eco-leaf text-white border-eco-leaf';
              else if (status === 'present') bgColor = 'bg-eco-sun text-eco-earth border-eco-sun';
              else bgColor = 'bg-muted-foreground/30 text-foreground border-muted-foreground/30';
            }

            return (
              <div
                key={j}
                className={`w-12 h-12 flex items-center justify-center font-bold text-xl rounded-lg ${bgColor} ${
                  letter && !isSubmitted ? 'animate-scale-in border-primary' : ''
                }`}
              >
                {letter}
              </div>
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
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Eco Wordle</h1>
              <p className="text-sm text-muted-foreground">Guess the eco-word!</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-sm mx-auto space-y-6">
          {/* Grid */}
          <div className="space-y-1.5 animate-fade-in-up">
            {renderGrid()}
          </div>

          {/* Game Over Message */}
          {gameState !== 'playing' && (
            <div className={`eco-card text-center animate-scale-in ${
              gameState === 'won' ? 'border-eco-leaf' : 'border-destructive'
            }`}>
              <h2 className="font-display font-bold text-xl mb-2">
                {gameState === 'won' ? '🎉 You Won!' : `The word was: ${targetWord}`}
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
                  <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                    Dashboard
                  </Button>
                  <Button onClick={startNewGame} className="flex-1 gradient-nature text-primary-foreground">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}
            </div>
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
