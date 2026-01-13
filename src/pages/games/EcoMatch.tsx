import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameProgress } from '@/hooks/useGameProgress';

interface MatchItem {
  id: number;
  item: string;
  action: string;
  emoji: string;
}

const allMatchPairs: MatchItem[] = [
  { id: 1, item: 'Plastic bottle', action: 'Recycle in blue bin', emoji: '🧴' },
  { id: 2, item: 'Food scraps', action: 'Compost them', emoji: '🍎' },
  { id: 3, item: 'Old clothes', action: 'Donate to charity', emoji: '👕' },
  { id: 4, item: 'Used batteries', action: 'Take to collection point', emoji: '🔋' },
  { id: 5, item: 'Broken electronics', action: 'E-waste recycling', emoji: '📱' },
  { id: 6, item: 'Glass jars', action: 'Reuse or recycle', emoji: '🫙' },
  { id: 7, item: 'Newspaper', action: 'Paper recycling bin', emoji: '📰' },
  { id: 8, item: 'Cardboard boxes', action: 'Flatten and recycle', emoji: '📦' },
];

const EcoMatch = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const [round, setRound] = useState(1);
  const [currentPairs, setCurrentPairs] = useState<MatchItem[]>([]);
  const [shuffledActions, setShuffledActions] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [matchedItems, setMatchedItems] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalRounds] = useState(3);

  const initializeRound = () => {
    // Pick 4 random pairs for this round
    const shuffled = [...allMatchPairs].sort(() => Math.random() - 0.5);
    const pairs = shuffled.slice(0, 4);
    setCurrentPairs(pairs);
    setShuffledActions(pairs.map(p => p.action).sort(() => Math.random() - 0.5));
    setSelectedItem(null);
    setSelectedAction(null);
    setMatchedItems([]);
    setFeedback(null);
  };

  useEffect(() => {
    initializeRound();
  }, [round]);

  const handleItemClick = (id: number) => {
    if (matchedItems.includes(id)) return;
    setSelectedItem(id);
    setFeedback(null);
  };

  const handleActionClick = (action: string) => {
    if (!selectedItem) return;
    
    const item = currentPairs.find(p => p.id === selectedItem);
    if (!item) return;

    setSelectedAction(action);

    if (item.action === action) {
      // Correct match
      setMatchedItems([...matchedItems, selectedItem]);
      setScore(score + 5);
      setFeedback({ correct: true, message: 'Correct! Great job! 🎉' });
      
      setTimeout(() => {
        setSelectedItem(null);
        setSelectedAction(null);
        setFeedback(null);
        
        // Check if round complete
        if (matchedItems.length + 1 === currentPairs.length) {
          if (round < totalRounds) {
            setRound(round + 1);
          } else {
            finishGame();
          }
        }
      }, 1000);
    } else {
      // Wrong match
      setFeedback({ correct: false, message: 'Not quite! Try again.' });
      setTimeout(() => {
        setSelectedItem(null);
        setSelectedAction(null);
        setFeedback(null);
      }, 1000);
    }
  };

  const finishGame = async () => {
    await completeGame('eco-match', score);
    setGameComplete(true);
  };

  if (gameComplete) {
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <div className="container mx-auto max-w-lg pt-8">
          <Card className="eco-card text-center animate-scale-in">
            <CardHeader>
              <div className="w-20 h-20 mx-auto rounded-full bg-eco-sun/30 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-eco-earth" />
              </div>
              <CardTitle className="font-display text-2xl">Game Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="text-5xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground mt-2">points earned</p>
              </div>

              <p className="text-muted-foreground">
                You've learned how to match items with their eco-friendly actions!
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setRound(1);
                    setScore(0);
                    setGameComplete(false);
                    initializeRound();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Play Again
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  className="w-full gradient-nature text-primary-foreground"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-sky leaf-pattern p-4">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">🧠 Eco Match</h1>
            <p className="text-sm text-muted-foreground">Round {round} of {totalRounds}</p>
          </div>
          <div className="bg-eco-sun/20 px-4 py-2 rounded-full">
            <span className="font-bold text-eco-earth">{score} pts</span>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 animate-fade-in ${
            feedback.correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback.correct ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Instructions */}
        <Card className="eco-card mb-4">
          <CardContent className="py-3 text-center">
            <p className="text-sm text-muted-foreground">
              Match each item with the correct environmental action
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          {/* Items Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground text-center">Items</h3>
            {currentPairs.map((pair) => (
              <button
                key={pair.id}
                onClick={() => handleItemClick(pair.id)}
                disabled={matchedItems.includes(pair.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                  matchedItems.includes(pair.id)
                    ? 'border-green-300 bg-green-50 opacity-60'
                    : selectedItem === pair.id
                    ? 'border-primary bg-primary/10 shadow-soft'
                    : 'border-border hover:border-primary/50 bg-card'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{pair.emoji}</span>
                  <span className="font-medium text-sm">{pair.item}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Actions Column */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground text-center">Actions</h3>
            {shuffledActions.map((action, index) => {
              const isMatched = matchedItems.some(id => 
                currentPairs.find(p => p.id === id)?.action === action
              );
              return (
                <button
                  key={index}
                  onClick={() => handleActionClick(action)}
                  disabled={isMatched || !selectedItem}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    isMatched
                      ? 'border-green-300 bg-green-50 opacity-60'
                      : selectedAction === action
                      ? 'border-primary bg-primary/10'
                      : !selectedItem
                      ? 'border-border bg-card opacity-60'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <span className="font-medium text-sm">{action}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Matched: {matchedItems.length}/{currentPairs.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EcoMatch;