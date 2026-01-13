import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Globe, Car, Home, Utensils, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameProgress } from '@/hooks/useGameProgress';

interface Question {
  id: number;
  category: string;
  icon: React.ReactNode;
  question: string;
  options: { label: string; value: number }[];
}

const questions: Question[] = [
  {
    id: 1,
    category: 'Transportation',
    icon: <Car className="w-6 h-6" />,
    question: 'How do you usually travel to school?',
    options: [
      { label: 'Walk or bicycle', value: 0 },
      { label: 'Public transport', value: 2 },
      { label: 'Carpool with others', value: 3 },
      { label: 'Private car alone', value: 5 },
    ],
  },
  {
    id: 2,
    category: 'Home Energy',
    icon: <Home className="w-6 h-6" />,
    question: 'How often do you turn off lights when leaving a room?',
    options: [
      { label: 'Always', value: 0 },
      { label: 'Usually', value: 1 },
      { label: 'Sometimes', value: 3 },
      { label: 'Rarely', value: 5 },
    ],
  },
  {
    id: 3,
    category: 'Food',
    icon: <Utensils className="w-6 h-6" />,
    question: 'How often do you eat meat?',
    options: [
      { label: 'Never (vegetarian/vegan)', value: 0 },
      { label: '1-2 times a week', value: 2 },
      { label: '3-5 times a week', value: 4 },
      { label: 'Every day', value: 6 },
    ],
  },
  {
    id: 4,
    category: 'Water Usage',
    icon: <Globe className="w-6 h-6" />,
    question: 'How long are your showers usually?',
    options: [
      { label: 'Under 5 minutes', value: 0 },
      { label: '5-10 minutes', value: 2 },
      { label: '10-15 minutes', value: 4 },
      { label: 'Over 15 minutes', value: 6 },
    ],
  },
  {
    id: 5,
    category: 'Recycling',
    icon: <Globe className="w-6 h-6" />,
    question: 'How often do you recycle?',
    options: [
      { label: 'Always - everything possible', value: 0 },
      { label: 'Usually', value: 2 },
      { label: 'Sometimes', value: 4 },
      { label: 'Rarely or never', value: 6 },
    ],
  },
];

const CarbonFootprint = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Calculate results
      const score = newAnswers.reduce((a, b) => a + b, 0);
      setTotalScore(score);
      finishGame(score);
    }
  };

  const finishGame = async (score: number) => {
    // Lower score = better for environment = more points
    const maxPossibleScore = 28; // max carbon footprint
    const percentage = (maxPossibleScore - score) / maxPossibleScore;
    const pointsEarned = Math.round(10 + percentage * 20); // 10-30 points
    
    await completeGame('carbon-footprint', pointsEarned);
    setGameComplete(true);
  };

  const getFootprintLevel = (score: number) => {
    if (score <= 7) return { level: 'Eco Champion! 🏆', color: 'text-green-600', description: 'Your carbon footprint is minimal! You\'re a true environmental hero.' };
    if (score <= 14) return { level: 'Green Warrior 🌿', color: 'text-eco-leaf', description: 'You\'re doing great! A few small changes could make you even greener.' };
    if (score <= 21) return { level: 'Eco Learner 📚', color: 'text-yellow-600', description: 'There\'s room for improvement. Try making eco-friendly choices!' };
    return { level: 'Earth Explorer 🌍', color: 'text-orange-600', description: 'Start your green journey! Small changes make a big difference.' };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (gameComplete) {
    const result = getFootprintLevel(totalScore);
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <div className="container mx-auto max-w-lg pt-8">
          <Card className="eco-card text-center animate-scale-in">
            <CardHeader>
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">Your Carbon Footprint</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={`text-3xl font-bold ${result.color}`}>
                {result.level}
              </div>
              <p className="text-muted-foreground">{result.description}</p>
              
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Your Score</p>
                <p className="text-4xl font-bold text-foreground">{totalScore}/{28}</p>
                <p className="text-xs text-muted-foreground mt-1">(Lower is better)</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setSelectedOption(null);
                    setGameComplete(false);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
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
            <h1 className="font-display font-bold text-xl text-foreground">🌍 Carbon Footprint</h1>
            <p className="text-sm text-muted-foreground">Question {currentQuestion + 1} of {questions.length}</p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-6 h-2" />

        {/* Question Card */}
        <Card className="eco-card animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
              {currentQ.icon}
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">{currentQ.category}</p>
            <CardTitle className="font-display text-lg mt-2">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedOption(option.value)}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  selectedOption === option.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option.value ? 'border-primary bg-primary' : 'border-border'
                  }`}>
                    {selectedOption === option.value && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}

            <Button
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full mt-4 gradient-nature text-primary-foreground"
            >
              {currentQuestion < questions.length - 1 ? (
                <>Next <ArrowRight className="w-4 h-4 ml-2" /></>
              ) : (
                'See Results'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CarbonFootprint;