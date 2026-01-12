import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EnvironmentalQuiz() {
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
              <h1 className="font-display font-bold text-xl text-foreground">Environmental Quiz</h1>
              <p className="text-sm text-muted-foreground">Test your eco-knowledge!</p>
            </div>
          </div>
        </div>
      </header>

      {/* Game Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="eco-card max-w-2xl mx-auto text-center animate-scale-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
            <Brain className="w-10 h-10 text-purple-500 animate-float" />
          </div>

          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            🧠 Environmental Quiz Challenge
          </h2>

          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Challenge yourself with advanced environmental science questions. Perfect for Class 10 and above!
          </p>

          {/* Quiz Preview */}
          <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
            <p className="font-medium text-foreground mb-4">
              Sample Question: What is the main greenhouse gas responsible for global warming?
            </p>
            <div className="space-y-2">
              {['Oxygen (O₂)', 'Carbon Dioxide (CO₂)', 'Nitrogen (N₂)', 'Helium (He)'].map((option, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    i === 1
                      ? 'border-eco-leaf bg-eco-leaf/10'
                      : 'border-border bg-card'
                  }`}
                >
                  {i === 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-eco-leaf shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <span className={i === 1 ? 'text-eco-forest font-medium' : 'text-foreground'}>
                    {option}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-xl">
            Start Quiz 🧠
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            Coming soon! This game is under development.
          </p>
        </div>
      </main>
    </div>
  );
}
