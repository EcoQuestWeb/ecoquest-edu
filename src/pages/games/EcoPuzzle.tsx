import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Puzzle, RotateCcw, Trophy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';

const PUZZLE_IMAGES = [
  { id: 1, name: 'Forest', emoji: '🌲', tiles: ['🌲', '🌳', '🌴', '🌿', '🍃', '🌱', '🪴', '🎋', '🎍'] },
  { id: 2, name: 'Ocean', emoji: '🌊', tiles: ['🌊', '🐋', '🐬', '🐠', '🐟', '🦈', '🐙', '🦑', '🐚'] },
  { id: 3, name: 'Wildlife', emoji: '🦁', tiles: ['🦁', '🐘', '🦒', '🦓', '🦏', '🐆', '🦍', '🐻', '🦌'] },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function EcoPuzzle() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();

  const [currentPuzzle, setCurrentPuzzle] = useState(PUZZLE_IMAGES[0]);
  const [tiles, setTiles] = useState<string[]>([]);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    startNewPuzzle();
  }, []);

  const startNewPuzzle = () => {
    const puzzle = PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)];
    setCurrentPuzzle(puzzle);
    setTiles(shuffleArray(puzzle.tiles));
    setSelectedTiles([]);
    setMoves(0);
    setGameState('playing');
  };

  const isPuzzleSolved = () => {
    return tiles.every((tile, index) => tile === currentPuzzle.tiles[index]);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;

    if (selectedTiles.length === 0) {
      setSelectedTiles([index]);
    } else if (selectedTiles.length === 1) {
      const firstIndex = selectedTiles[0];
      if (firstIndex === index) {
        setSelectedTiles([]);
        return;
      }

      // Swap tiles
      const newTiles = [...tiles];
      [newTiles[firstIndex], newTiles[index]] = [newTiles[index], newTiles[firstIndex]];
      setTiles(newTiles);
      setMoves(prev => prev + 1);
      setSelectedTiles([]);

      // Check if solved
      setTimeout(() => {
        if (newTiles.every((tile, i) => tile === currentPuzzle.tiles[i])) {
          finishGame();
        }
      }, 100);
    }
  };

  const finishGame = async () => {
    setGameState('finished');
    setIsSaving(true);

    // Points based on efficiency (fewer moves = more points)
    const basePoints = 15;
    const bonusPoints = Math.max(0, 10 - Math.floor(moves / 5));
    const pointsEarned = basePoints + bonusPoints;

    await completeGame('eco-puzzle', pointsEarned);
    setIsSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-sky">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Eco Puzzle</h1>
                <p className="text-sm text-muted-foreground">{currentPuzzle.name} Theme</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <span className="text-sm text-muted-foreground">Moves:</span>
              <span className="font-bold text-foreground">{moves}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {gameState === 'playing' ? (
          <div className="max-w-sm mx-auto space-y-6 animate-fade-in-up">
            <p className="text-center text-muted-foreground">
              Tap two tiles to swap them. Arrange in order!
            </p>

            {/* Target Order */}
            <div className="bg-muted/50 rounded-xl p-3">
              <p className="text-xs text-muted-foreground text-center mb-2">Target Order:</p>
              <div className="flex justify-center gap-1">
                {currentPuzzle.tiles.map((tile, i) => (
                  <span key={i} className="text-lg">{tile}</span>
                ))}
              </div>
            </div>

            {/* Puzzle Grid */}
            <div className="grid grid-cols-3 gap-3">
              {tiles.map((tile, index) => {
                const isSelected = selectedTiles.includes(index);
                const isCorrect = tile === currentPuzzle.tiles[index];
                
                return (
                  <button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    className={`aspect-square text-4xl rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground scale-110 shadow-glow'
                        : isCorrect
                        ? 'bg-eco-leaf/20 border-2 border-eco-leaf'
                        : 'bg-card border-2 border-border hover:border-primary'
                    }`}
                  >
                    {tile}
                  </button>
                );
              })}
            </div>

            <Button variant="outline" onClick={startNewPuzzle} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Puzzle
            </Button>
          </div>
        ) : (
          <div className="eco-card max-w-md mx-auto text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-eco-leaf/20 mb-6">
              <Check className="w-10 h-10 text-eco-leaf" />
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Puzzle Solved! 🧩
            </h2>

            <div className="space-y-4 my-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Total Moves</p>
                <p className="font-bold text-3xl text-foreground">{moves}</p>
              </div>

              <div className="bg-eco-sun/20 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Points Earned</p>
                <p className="font-bold text-2xl text-eco-earth">
                  +{15 + Math.max(0, 10 - Math.floor(moves / 5))}
                </p>
              </div>
            </div>

            {isSaving ? (
              <p className="text-muted-foreground">Saving progress...</p>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Dashboard
                </Button>
                <Button onClick={startNewPuzzle} className="flex-1 gradient-nature text-primary-foreground">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
