import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';

const QUIZ_QUESTIONS = [
  {
    question: "What is the main greenhouse gas responsible for global warming?",
    options: ["Oxygen (O₂)", "Carbon Dioxide (CO₂)", "Nitrogen (N₂)", "Helium (He)"],
    correct: 1,
  },
  {
    question: "What percentage of Earth's water is freshwater?",
    options: ["About 97%", "About 50%", "About 3%", "About 25%"],
    correct: 2,
  },
  {
    question: "Which layer of the atmosphere contains the ozone layer?",
    options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"],
    correct: 1,
  },
  {
    question: "What is the largest source of ocean pollution?",
    options: ["Oil spills", "Land-based runoff", "Ship waste", "Fishing nets"],
    correct: 1,
  },
  {
    question: "Which renewable energy source generates the most electricity globally?",
    options: ["Solar", "Wind", "Hydropower", "Geothermal"],
    correct: 2,
  },
  {
    question: "What is biodiversity?",
    options: ["Number of humans", "Variety of life forms", "Amount of water", "Size of forests"],
    correct: 1,
  },
  {
    question: "What does 'carbon footprint' measure?",
    options: ["Shoe size", "CO₂ emissions", "Walking distance", "Carbon in soil"],
    correct: 1,
  },
  {
    question: "Which gas makes up about 78% of Earth's atmosphere?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    correct: 2,
  },
];

export default function EnvironmentalQuiz() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { completeGame } = useGameProgress();

  const [questions, setQuestions] = useState<typeof QUIZ_QUESTIONS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'finished'>('playing');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    // Redirect if not class 10+
    if (!loading && profile && profile.class < 10) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    startQuiz();
  }, []);

  const startQuiz = () => {
    const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameState('playing');
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        finishQuiz(index === currentQuestion.correct ? score + 1 : score);
      }
    }, 1500);
  };

  const finishQuiz = async (finalScore: number) => {
    setGameState('finished');
    setIsSaving(true);

    // 5 points per correct answer for advanced quiz
    const pointsEarned = finalScore * 5;

    if (pointsEarned > 0) {
      await completeGame('environmental-quiz', pointsEarned);
    }

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
                <h1 className="font-display font-bold text-xl text-foreground">Environmental Quiz</h1>
                <p className="text-sm text-muted-foreground">Advanced Challenge</p>
              </div>
            </div>
            {gameState === 'playing' && (
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full">
                <span className="text-sm text-purple-600">{currentIndex + 1}/{questions.length}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {gameState === 'playing' && currentQuestion ? (
          <div className="max-w-lg mx-auto space-y-6 animate-fade-in-up">
            {/* Progress bar */}
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="eco-card">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let optionClass = 'bg-muted hover:bg-muted/80 border-2 border-transparent';
                  
                  if (showResult) {
                    if (index === currentQuestion.correct) {
                      optionClass = 'bg-eco-leaf/20 border-2 border-eco-leaf';
                    } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                      optionClass = 'bg-destructive/20 border-2 border-destructive';
                    }
                  } else if (selectedAnswer === index) {
                    optionClass = 'bg-purple-100 border-2 border-purple-500';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${optionClass}`}
                    >
                      <span className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-foreground">{option}</span>
                      {showResult && index === currentQuestion.correct && (
                        <Check className="w-5 h-5 text-eco-leaf" />
                      )}
                      {showResult && index === selectedAnswer && index !== currentQuestion.correct && (
                        <X className="w-5 h-5 text-destructive" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="eco-card max-w-md mx-auto text-center animate-scale-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-6">
              <Brain className="w-10 h-10 text-purple-500" />
            </div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Quiz Complete! 🧠
            </h2>

            <div className="space-y-4 my-6">
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="font-bold text-3xl text-foreground">{score} / {questions.length}</p>
              </div>

              <div className="bg-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-600">Points Earned</p>
                <p className="font-bold text-2xl text-purple-700">+{score * 5}</p>
              </div>

              <p className="text-muted-foreground">
                {score === questions.length 
                  ? "Perfect score! You're an eco-genius! 🌟"
                  : score >= questions.length / 2
                  ? "Great job! Keep learning! 📚"
                  : "Keep practicing to improve! 💪"}
              </p>
            </div>

            {isSaving ? (
              <p className="text-muted-foreground">Saving progress...</p>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
                  Dashboard
                </Button>
                <Button onClick={startQuiz} className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
