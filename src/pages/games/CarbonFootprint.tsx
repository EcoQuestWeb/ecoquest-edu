import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe, Car, Home, Utensils, Check, Droplets, Recycle, Zap, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';

interface Question {
  id: number;
  category: string;
  icon: React.ReactNode;
  question: string;
  options: { label: string; value: number }[];
}

const QUESTIONS_BY_LEVEL: Record<number, Question[]> = {
  1: [
    { id: 1, category: 'Transportation', icon: <Car className="w-6 h-6" />, question: 'How do you usually travel to school?', options: [{ label: 'Walk or bicycle', value: 0 }, { label: 'Public transport', value: 2 }, { label: 'Carpool with others', value: 3 }, { label: 'Private car alone', value: 5 }] },
    { id: 2, category: 'Home Energy', icon: <Home className="w-6 h-6" />, question: 'How often do you turn off lights when leaving a room?', options: [{ label: 'Always', value: 0 }, { label: 'Usually', value: 1 }, { label: 'Sometimes', value: 3 }, { label: 'Rarely', value: 5 }] },
    { id: 3, category: 'Recycling', icon: <Recycle className="w-6 h-6" />, question: 'How often do you recycle?', options: [{ label: 'Always - everything possible', value: 0 }, { label: 'Usually', value: 2 }, { label: 'Sometimes', value: 4 }, { label: 'Rarely or never', value: 6 }] },
  ],
  2: [
    { id: 4, category: 'Food', icon: <Utensils className="w-6 h-6" />, question: 'How often do you eat meat?', options: [{ label: 'Never (vegetarian/vegan)', value: 0 }, { label: '1-2 times a week', value: 2 }, { label: '3-5 times a week', value: 4 }, { label: 'Every day', value: 6 }] },
    { id: 5, category: 'Water Usage', icon: <Droplets className="w-6 h-6" />, question: 'How long are your showers usually?', options: [{ label: 'Under 5 minutes', value: 0 }, { label: '5-10 minutes', value: 2 }, { label: '10-15 minutes', value: 4 }, { label: 'Over 15 minutes', value: 6 }] },
    { id: 6, category: 'Electronics', icon: <Zap className="w-6 h-6" />, question: 'Do you unplug devices when not in use?', options: [{ label: 'Always', value: 0 }, { label: 'Usually', value: 2 }, { label: 'Sometimes', value: 4 }, { label: 'Never', value: 6 }] },
  ],
  3: [
    { id: 7, category: 'Shopping', icon: <ShoppingBag className="w-6 h-6" />, question: 'How often do you buy second-hand items?', options: [{ label: 'Very often', value: 0 }, { label: 'Sometimes', value: 2 }, { label: 'Rarely', value: 4 }, { label: 'Never', value: 6 }] },
    { id: 8, category: 'Food Waste', icon: <Utensils className="w-6 h-6" />, question: 'How much food do you throw away?', options: [{ label: 'Almost none - I plan meals', value: 0 }, { label: 'A little bit', value: 2 }, { label: 'Some food regularly', value: 4 }, { label: 'Quite a lot', value: 6 }] },
    { id: 9, category: 'Transportation', icon: <Car className="w-6 h-6" />, question: 'How often do you take flights?', options: [{ label: 'Never', value: 0 }, { label: '1-2 times a year', value: 3 }, { label: '3-5 times a year', value: 5 }, { label: 'More than 5 times', value: 7 }] },
    { id: 10, category: 'Home', icon: <Home className="w-6 h-6" />, question: 'What temperature do you keep your home in winter?', options: [{ label: 'Cool (below 18°C)', value: 0 }, { label: 'Moderate (18-21°C)', value: 2 }, { label: 'Warm (21-24°C)', value: 4 }, { label: 'Very warm (above 24°C)', value: 6 }] },
  ],
  4: [
    { id: 11, category: 'Water', icon: <Droplets className="w-6 h-6" />, question: 'Do you use a water-saving showerhead?', options: [{ label: 'Yes, and I love it', value: 0 }, { label: 'Yes, but rarely use it', value: 2 }, { label: 'No, but considering', value: 4 }, { label: 'No, never thought about it', value: 6 }] },
    { id: 12, category: 'Energy', icon: <Zap className="w-6 h-6" />, question: 'Do you use renewable energy at home?', options: [{ label: 'Yes, solar/wind', value: 0 }, { label: 'Partially renewable', value: 2 }, { label: 'Considering switching', value: 4 }, { label: 'No, standard grid', value: 6 }] },
    { id: 13, category: 'Shopping', icon: <ShoppingBag className="w-6 h-6" />, question: 'Do you bring reusable bags shopping?', options: [{ label: 'Always', value: 0 }, { label: 'Usually', value: 2 }, { label: 'Sometimes', value: 4 }, { label: 'Never', value: 6 }] },
    { id: 14, category: 'Food', icon: <Utensils className="w-6 h-6" />, question: 'Do you buy locally grown food?', options: [{ label: 'Always when possible', value: 0 }, { label: 'Often', value: 2 }, { label: 'Sometimes', value: 4 }, { label: 'Rarely', value: 6 }] },
  ],
  5: [
    { id: 15, category: 'Transport', icon: <Car className="w-6 h-6" />, question: 'Would you consider an electric vehicle?', options: [{ label: 'Already have one', value: 0 }, { label: 'Planning to get one', value: 2 }, { label: 'Maybe in the future', value: 4 }, { label: 'No interest', value: 6 }] },
    { id: 16, category: 'Home', icon: <Home className="w-6 h-6" />, question: 'Do you compost food waste?', options: [{ label: 'Yes, actively compost', value: 0 }, { label: 'Sometimes', value: 2 }, { label: 'Want to start', value: 4 }, { label: 'No', value: 6 }] },
    { id: 17, category: 'Lifestyle', icon: <Globe className="w-6 h-6" />, question: 'Do you offset your carbon emissions?', options: [{ label: 'Yes, regularly', value: 0 }, { label: 'Occasionally', value: 2 }, { label: 'Considering it', value: 4 }, { label: 'No', value: 6 }] },
    { id: 18, category: 'Water', icon: <Droplets className="w-6 h-6" />, question: 'Do you collect rainwater?', options: [{ label: 'Yes, for garden/cleaning', value: 0 }, { label: 'Sometimes', value: 2 }, { label: 'Planning to', value: 4 }, { label: 'No', value: 6 }] },
    { id: 19, category: 'Energy', icon: <Zap className="w-6 h-6" />, question: 'Do you use smart thermostats?', options: [{ label: 'Yes, optimized', value: 0 }, { label: 'Yes, basic use', value: 2 }, { label: 'Planning to', value: 4 }, { label: 'No', value: 6 }] },
  ],
};

interface LevelConfig {
  level: number;
  questions: Question[];
  targetScore: number; // Lower is better
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, questions: QUESTIONS_BY_LEVEL[1], targetScore: 8 },
  { level: 2, questions: QUESTIONS_BY_LEVEL[2], targetScore: 10 },
  { level: 3, questions: QUESTIONS_BY_LEVEL[3], targetScore: 14 },
  { level: 4, questions: QUESTIONS_BY_LEVEL[4], targetScore: 12 },
  { level: 5, questions: QUESTIONS_BY_LEVEL[5], targetScore: 15 },
];

const CarbonFootprint = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    setQuestions(config.questions);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setTotalScore(0);
    setGameState('playing');
  };

  const handleNext = async () => {
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
      await finishGame(score);
    }
  };

  const finishGame = async (score: number) => {
    const config = getLevelConfig();
    const maxPossibleScore = config.questions.length * 6;
    const percentage = (maxPossibleScore - score) / maxPossibleScore;
    const pointsEarned = Math.round(10 + percentage * 20);
    
    await completeGame('carbon-footprint', pointsEarned);
    
    // Win if score is below target (lower is better)
    if (score <= config.targetScore) {
      completeLevel('carbon-footprint', selectedLevel, pointsEarned);
      if (selectedLevel < 5) {
        setShowUnlockAnimation(true);
      }
    }
    
    setGameState('finished');
  };

  const getFootprintLevel = (score: number) => {
    const config = getLevelConfig();
    const maxScore = config.questions.length * 6;
    const percentage = score / maxScore;
    
    if (percentage <= 0.25) return { level: 'Eco Champion! 🏆', color: 'text-green-600', description: 'Your carbon footprint is minimal!' };
    if (percentage <= 0.5) return { level: 'Green Warrior 🌿', color: 'text-eco-leaf', description: 'You\'re doing great!' };
    if (percentage <= 0.75) return { level: 'Eco Learner 📚', color: 'text-yellow-600', description: 'There\'s room for improvement.' };
    return { level: 'Earth Explorer 🌍', color: 'text-orange-600', description: 'Start your green journey!' };
  };

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="carbon-footprint"
        gameTitle="Carbon Footprint 🌍"
        gameDescription="Discover your environmental impact!"
        gameIcon={<Globe className="w-6 h-6 text-teal-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (gameState === 'finished') {
    const result = getFootprintLevel(totalScore);
    const won = totalScore <= config.targetScore;
    
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <LevelUnlockAnimation
          show={showUnlockAnimation}
          level={selectedLevel + 1}
          onComplete={() => setShowUnlockAnimation(false)}
        />
        
        <div className="container mx-auto max-w-lg pt-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Card className="eco-card text-center">
              <CardHeader>
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  won ? 'bg-eco-leaf/20' : 'bg-orange-100'
                }`}>
                  <span className="text-5xl">{won ? '🎉' : '🌍'}</span>
                </div>
                <CardTitle className="font-display text-2xl">
                  {won ? 'Level Complete!' : 'Keep Learning!'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className={`text-2xl font-bold ${result.color}`}>
                  {result.level}
                </div>
                <p className="text-muted-foreground">{result.description}</p>
                
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-2">Carbon Score</p>
                  <p className="text-4xl font-bold text-foreground">{totalScore}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Lower is better - Target: {config.targetScore})
                  </p>
                </div>

                <div className="space-y-3">
                  <Button onClick={startGame} variant="outline" className="w-full">
                    {won ? 'Play Again' : 'Try Again'}
                  </Button>
                  <Button
                    onClick={() => setGameState('menu')}
                    className="w-full gradient-nature text-primary-foreground"
                  >
                    Back to Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-sky leaf-pattern p-4">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setGameState('menu')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg sm:text-xl text-foreground">
              Level {selectedLevel} - Carbon Footprint
            </h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-6 h-2" />

        {/* Question Card */}
        <motion.div
          key={currentQ.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <Card className="eco-card">
            <CardHeader className="text-center pb-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                {currentQ.icon}
              </div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">{currentQ.category}</p>
              <CardTitle className="font-display text-lg mt-2">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedOption(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    selectedOption === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === option.value ? 'border-primary bg-primary' : 'border-border'
                    }`}>
                      {selectedOption === option.value && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </motion.button>
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
        </motion.div>
      </div>
    </div>
  );
};

export default CarbonFootprint;
