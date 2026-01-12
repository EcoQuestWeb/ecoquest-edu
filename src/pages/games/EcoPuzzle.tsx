import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Puzzle, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EcoPuzzle() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-sky">
      {/* Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Eco Puzzle</h1>
              <p className="text-sm text-muted-foreground">Solve nature puzzles!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="eco-card max-w-2xl mx-auto text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-eco-sky/30 mb-6">
            <Puzzle className="w-10 h-10 text-blue-500 animate-float" />
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            🧩 Eco Puzzle Challenge
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Complete beautiful nature-themed puzzles and learn fascinating eco-facts along the way!
          </p>

          {/* Puzzle Preview */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 max-w-xs mx-auto">
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gradient-to-br from-eco-leaf/40 to-eco-sky/40 flex items-center justify-center"
                >
                  <Grid3X3 className="w-6 h-6 text-eco-forest/30" />
                </div>
              ))}
            </div>
          </div>

          <Button className="gradient-nature text-primary-foreground px-8 py-6 text-lg rounded-xl">
            Start Puzzle 🧩
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Coming soon! This game is under development.
          </p>
        </div>
      </main>
    </div>
  );
}
