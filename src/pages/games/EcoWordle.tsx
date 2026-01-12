import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EcoWordle() {
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
              <h1 className="font-display font-bold text-xl text-foreground">Eco Wordle</h1>
              <p className="text-sm text-muted-foreground">Guess the eco-word!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="eco-card max-w-2xl mx-auto text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-eco-sun/30 mb-6">
            <Type className="w-10 h-10 text-eco-earth animate-float" />
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            📝 Eco Wordle Challenge
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Guess the hidden eco-word in 6 tries! Learn new environmental vocabulary while having fun.
          </p>

          {/* Wordle Preview */}
          <div className="space-y-2 mb-8 max-w-xs mx-auto">
            {['EARTH', 'OZONE', '     '].map((word, rowIdx) => (
              <div key={rowIdx} className="flex gap-2 justify-center">
                {word.split('').map((letter, i) => (
                  <div
                    key={i}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                      rowIdx === 0
                        ? 'bg-eco-leaf text-primary-foreground'
                        : rowIdx === 1
                        ? 'bg-eco-sun text-eco-earth'
                        : 'bg-muted border-2 border-border'
                    }`}
                  >
                    {letter !== ' ' ? letter : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Button className="gradient-nature text-primary-foreground px-8 py-6 text-lg rounded-xl">
            Start Wordle 📝
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Coming soon! This game is under development.
          </p>
        </div>
      </main>
    </div>
  );
}
