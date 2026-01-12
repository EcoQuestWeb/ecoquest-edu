import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Recycle, Check, X, RotateCcw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';

const WASTE_ITEMS = [
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
];

const BINS = [
  { id: 'plastic', name: 'Plastic', color: 'bg-blue-500', emoji: '♻️' },
  { id: 'paper', name: 'Paper', color: 'bg-yellow-500', emoji: '📄' },
  { id: 'organic', name: 'Organic', color: 'bg-green-500', emoji: '🌱' },
  { id: 'glass', name: 'Glass', color: 'bg-purple-500', emoji: '🔮' },
  { id: 'metal', name: 'Metal', color: 'bg-gray-500', emoji: '🔧' },
];

export default function WasteSorting() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { completeGame } = useGameProgress();
  
  const [items, setItems] = useState<typeof WASTE_ITEMS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Shuffle items at start
    const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5);
    setItems(shuffled);
  }, []);

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
        finishGame(isCorrect ? score + 10 : score);
      }
    }, 1200);
  };

  const finishGame = async (finalScore: number) => {
    setGameState('finished');
    setIsSaving(true);
    
    // Award points based on performance (2 points per correct answer)
    const pointsEarned = Math.floor(finalScore / 10) * 2;
    
    if (pointsEarned > 0) {
      await completeGame('waste-sorting', pointsEarned);
    }
    
    setIsSaving(false);
  };

  const restartGame = () => {
    const shuffled = [...WASTE_ITEMS].sort(() => Math.random() - 0.5).slice(0, 5);
    setItems(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setWrongAnswers(0);
    setGameState('playing');
    setFeedback(null);
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
                <h1 className="font-display font-bold text-xl text-foreground">Waste Sorting</h1>
                <p className="text-sm text-muted-foreground">Sort items correctly!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-eco-sun/20 px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-eco-earth" />
              <span className="font-bold text-eco-earth">{score}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {gameState === 'playing' && currentItem ? (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
            {/* Progress */}
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <span>Item {currentIndex + 1} of {items.length}</span>
            </div>

            {/* Current Item */}
            <div className="eco-card text-center relative overflow-hidden">
              {feedback && (
                <div className={`absolute inset-0 flex items-center justify-center z-10 ${
                  feedback.correct ? 'bg-eco-leaf/90' : 'bg-destructive/90'
                } animate-scale-in`}>
                  <div className="text-white text-center">
                    {feedback.correct ? (
                      <Check className="w-16 h-16 mx-auto mb-2" />
                    ) : (
                      <X className="w-16 h-16 mx-auto mb-2" />
                    )}
                    <p className="font-bold text-lg">{feedback.message}</p>
                  </div>
                </div>
              )}
              
              <div className="text-6xl mb-4">{currentItem.emoji}</div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                {currentItem.name}
              </h2>
              <p className="text-muted-foreground">Which bin does this go in?</p>
            </div>

            {/* Bins */}
            <div className="grid grid-cols-5 gap-2">
              {BINS.map(bin => (
                <button
                  key={bin.id}
                  onClick={() => handleBinSelect(bin.id)}
                  disabled={!!feedback}
                  className={`${bin.color} p-3 rounded-xl text-white text-center transition-transform hover:scale-105 active:scale-95 disabled:opacity-50`}
                >
                  <div className="text-2xl mb-1">{bin.emoji}</div>
                  <p className="text-xs font-medium">{bin.name}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="eco-card max-w-md mx-auto text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-eco-leaf/20 mb-6">
              <Recycle className="w-10 h-10 text-eco-leaf" />
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Game Complete! 🎉
            </h2>

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
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Back to Dashboard
                </Button>
                <Button onClick={restartGame} className="flex-1 gradient-nature text-primary-foreground">
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
