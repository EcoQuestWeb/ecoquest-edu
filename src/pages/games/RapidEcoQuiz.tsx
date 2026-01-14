import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Zap, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useAuth } from '@/contexts/AuthContext';

interface Question {
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const allEasyQuestions: Question[] = [
  { question: 'What color bin is usually for paper recycling?', options: ['Red', 'Blue', 'Green', 'Yellow'], correct: 1, difficulty: 'easy' },
  { question: 'Which gas do trees absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2, difficulty: 'easy' },
  { question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, difficulty: 'easy' },
  { question: 'Which of these can be composted?', options: ['Plastic bottle', 'Banana peel', 'Glass jar', 'Metal can'], correct: 1, difficulty: 'easy' },
  { question: 'What do solar panels convert into electricity?', options: ['Wind', 'Water', 'Sunlight', 'Heat'], correct: 2, difficulty: 'easy' },
  { question: 'How long does a plastic bag take to decompose?', options: ['1 year', '10 years', '100-500 years', '1 week'], correct: 2, difficulty: 'easy' },
  { question: 'What is the symbol for recycling?', options: ['Circle', 'Square', 'Three arrows', 'Star'], correct: 2, difficulty: 'easy' },
  { question: 'Which animal is endangered due to climate change?', options: ['Cat', 'Dog', 'Polar bear', 'Cow'], correct: 2, difficulty: 'easy' },
  { question: 'What is rainwater harvesting?', options: ['Selling rain', 'Collecting rainwater', 'Making artificial rain', 'Drinking rain'], correct: 1, difficulty: 'easy' },
  { question: 'Which energy source is NOT renewable?', options: ['Solar', 'Wind', 'Coal', 'Hydroelectric'], correct: 2, difficulty: 'easy' },
];

const allMediumQuestions: Question[] = [
  { question: 'What percentage of Earth\'s water is freshwater?', options: ['About 3%', 'About 30%', 'About 50%', 'About 70%'], correct: 0, difficulty: 'medium' },
  { question: 'Which renewable energy source is most used globally?', options: ['Solar', 'Wind', 'Hydropower', 'Geothermal'], correct: 2, difficulty: 'medium' },
  { question: 'What is the main cause of ocean acidification?', options: ['Plastic pollution', 'CO2 absorption', 'Oil spills', 'Overfishing'], correct: 1, difficulty: 'medium' },
  { question: 'Which country produces the most renewable energy?', options: ['USA', 'Germany', 'China', 'Brazil'], correct: 2, difficulty: 'medium' },
  { question: 'What is the ozone layer?', options: ['A type of cloud', 'Protective gas layer', 'Ocean current', 'Mountain range'], correct: 1, difficulty: 'medium' },
  { question: 'What causes the greenhouse effect?', options: ['Too many plants', 'Trapped heat from gases', 'Cold air', 'Ocean waves'], correct: 1, difficulty: 'medium' },
];

const allHardQuestions: Question[] = [
  { question: 'What is the estimated number of species that go extinct every day?', options: ['1-5', '10-20', '50-100', '150-200'], correct: 3, difficulty: 'hard' },
  { question: 'What percentage of global emissions come from food production?', options: ['10-15%', '26-34%', '5-8%', '50-60%'], correct: 1, difficulty: 'hard' },
  { question: 'Which biome stores the most carbon?', options: ['Tropical rainforest', 'Boreal forest', 'Ocean', 'Grasslands'], correct: 2, difficulty: 'hard' },
  { question: 'What is the Paris Agreement target for global warming?', options: ['1.5°C', '3°C', '5°C', '0.5°C'], correct: 0, difficulty: 'hard' },
  { question: 'How much plastic enters the ocean annually?', options: ['1 million tons', '8 million tons', '100 million tons', '500 thousand tons'], correct: 1, difficulty: 'hard' },
];

const RapidEcoQuiz = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const isAdvanced = profile?.class && profile.class >= 10;

  const initializeQuestions = useCallback(() => {
    let selectedQuestions: Question[];
    if (isAdvanced) {
      // Mix of all difficulties for advanced students - shuffled
      const easy = [...allEasyQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
      const medium = [...allMediumQuestions].sort(() => Math.random() - 0.5).slice(0, 3);
      const hard = [...allHardQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
      selectedQuestions = [...easy, ...medium, ...hard].sort(() => Math.random() - 0.5);
    } else {
      // Easier mix for younger students - shuffled
      const easy = [...allEasyQuestions].sort(() => Math.random() - 0.5).slice(0, 5);
      const medium = [...allMediumQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
      selectedQuestions = [...easy, ...medium].sort(() => Math.random() - 0.5);
    }
    setQuestions(selectedQuestions);
  }, [isAdvanced]);

  useEffect(() => {
    initializeQuestions();
  }, [initializeQuestions]);

  useEffect(() => {
    if (!gameStarted || showResult || gameComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, showResult, gameComplete, currentQuestion]);

  const handleTimeout = () => {
    setStreak(0);
    setShowResult(true);
    setSelectedAnswer(-1); // Indicate timeout
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === questions[currentQuestion].correct;
    const difficultyBonus = questions[currentQuestion].difficulty === 'hard' ? 3 : 
                           questions[currentQuestion].difficulty === 'medium' ? 2 : 1;
    const timeBonus = Math.ceil(timeLeft / 3);
    
    if (isCorrect) {
      const points = 3 * difficultyBonus + timeBonus + (streak >= 2 ? 2 : 0);
      setScore(score + points);
      setStreak(streak + 1);
      if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(questions[currentQuestion + 1].difficulty === 'hard' ? 12 : 10);
    } else {
      await completeGame('rapid-eco-quiz', score);
      setGameComplete(true);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(10);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <div className="container mx-auto max-w-lg pt-8">
          <Card className="eco-card text-center animate-scale-in">
            <CardHeader>
              <div className="w-20 h-20 mx-auto rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-yellow-600" />
              </div>
              <CardTitle className="font-display text-2xl">⚡ Rapid Eco Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 text-left bg-muted/50 rounded-xl p-4">
                <h3 className="font-semibold">How to Play:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Answer quickly - you have 10 seconds per question!</li>
                  <li>• Faster answers = more bonus points</li>
                  <li>• Build streaks for extra points</li>
                  {isAdvanced && <li>• 🔥 Advanced mode: Harder questions for more points!</li>}
                </ul>
              </div>

              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">{questions.length} Questions</p>
                <p className="font-bold text-primary">{isAdvanced ? 'Advanced Mode' : 'Standard Mode'}</p>
              </div>

              <Button
                onClick={startGame}
                className="w-full gradient-nature text-primary-foreground"
              >
                Start Quiz ⚡
              </Button>
              
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <div className="container mx-auto max-w-lg pt-8">
          <Card className="eco-card text-center animate-scale-in">
            <CardHeader>
              <div className="w-20 h-20 mx-auto rounded-full bg-eco-sun/30 flex items-center justify-center mb-4">
                <Zap className="w-10 h-10 text-eco-earth" />
              </div>
              <CardTitle className="font-display text-2xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="text-5xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground mt-2">points earned</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{maxStreak}</p>
                  <p className="text-xs text-muted-foreground">Best Streak 🔥</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-foreground">{questions.length}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setStreak(0);
                    setMaxStreak(0);
                    setSelectedAnswer(null);
                    setShowResult(false);
                    setGameComplete(false);
                    setGameStarted(false);
                    initializeQuestions();
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

  const question = questions[currentQuestion];
  const timerColor = timeLeft <= 3 ? 'text-red-500' : timeLeft <= 5 ? 'text-yellow-500' : 'text-primary';

  return (
    <div className="min-h-screen gradient-sky leaf-pattern p-4">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">⚡ Rapid Quiz</h1>
            <p className="text-sm text-muted-foreground">Q{currentQuestion + 1}/{questions.length}</p>
          </div>
          {streak >= 2 && (
            <div className="bg-orange-100 px-3 py-1 rounded-full">
              <span className="text-orange-600 font-bold text-sm">🔥 {streak}</span>
            </div>
          )}
          <div className="bg-eco-sun/20 px-3 py-2 rounded-full">
            <span className="font-bold text-eco-earth text-sm">{score}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Timer className={`w-5 h-5 ${timerColor}`} />
            <span className={`text-2xl font-bold ${timerColor}`}>{timeLeft}s</span>
          </div>
          <Progress value={(timeLeft / 10) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="eco-card animate-fade-in">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                question.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {question.difficulty}
              </span>
            </div>
            <CardTitle className="font-display text-lg leading-snug">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => {
              let buttonStyle = 'border-border hover:border-primary/50 bg-card';
              
              if (showResult) {
                if (index === question.correct) {
                  buttonStyle = 'border-green-500 bg-green-50';
                } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                  buttonStyle = 'border-red-500 bg-red-50';
                }
              } else if (selectedAnswer === index) {
                buttonStyle = 'border-primary bg-primary/10';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${buttonStyle}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="font-medium flex-1">{option}</span>
                  {showResult && index === question.correct && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {showResult && index === selectedAnswer && selectedAnswer !== question.correct && (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </button>
              );
            })}

            {showResult && (
              <Button
                onClick={nextQuestion}
                className="w-full mt-4 gradient-nature text-primary-foreground animate-fade-in"
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RapidEcoQuiz;