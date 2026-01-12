import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Recycle, Trash2, Leaf, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WasteSorting() {
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
              <h1 className="font-display font-bold text-xl text-foreground">Waste Sorting Game</h1>
              <p className="text-sm text-muted-foreground">Sort waste into correct bins!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="eco-card max-w-2xl mx-auto text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-eco-leaf/20 mb-6">
            <Recycle className="w-10 h-10 text-eco-leaf animate-spin" style={{ animationDuration: '3s' }} />
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            🗑️ Waste Sorting Challenge
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Drag and drop waste items into the correct recycling bins. Learn to separate plastic, paper, organic waste, and more!
          </p>

          {/* Bins Preview */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-100 rounded-xl p-4 text-center">
              <Droplets className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-blue-700">Plastic</p>
            </div>
            <div className="bg-yellow-100 rounded-xl p-4 text-center">
              <Trash2 className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-yellow-700">Paper</p>
            </div>
            <div className="bg-green-100 rounded-xl p-4 text-center">
              <Leaf className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-green-700">Organic</p>
            </div>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <Trash2 className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">General</p>
            </div>
          </div>

          <Button className="gradient-nature text-primary-foreground px-8 py-6 text-lg rounded-xl">
            Start Game 🎮
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Coming soon! This game is under development.
          </p>
        </div>
      </main>
    </div>
  );
}
