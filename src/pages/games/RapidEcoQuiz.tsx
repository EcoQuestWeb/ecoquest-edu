import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Zap, Check, X, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGameSounds } from '@/hooks/useGameSounds';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

const QUESTIONS_BY_LEVEL: Record<number, Question[]> = {
  1: [
    { question: 'What color bin is usually for paper recycling?', options: ['Red', 'Blue', 'Green', 'Yellow'], correct: 1, difficulty: 'easy' },
    { question: 'Which gas do trees absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2, difficulty: 'easy' },
    { question: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3, difficulty: 'easy' },
    { question: 'Which of these can be composted?', options: ['Plastic bottle', 'Banana peel', 'Glass jar', 'Metal can'], correct: 1, difficulty: 'easy' },
    { question: 'What do solar panels convert into electricity?', options: ['Wind', 'Water', 'Sunlight', 'Heat'], correct: 2, difficulty: 'easy' },
  ],
  2: [
    { question: 'How long does a plastic bag take to decompose?', options: ['1 year', '10 years', '100-500 years', '1 week'], correct: 2, difficulty: 'easy' },
    { question: 'What is the symbol for recycling?', options: ['Circle', 'Square', 'Three arrows', 'Star'], correct: 2, difficulty: 'easy' },
    { question: 'Which animal is endangered due to climate change?', options: ['Cat', 'Dog', 'Polar bear', 'Cow'], correct: 2, difficulty: 'easy' },
    { question: 'What is rainwater harvesting?', options: ['Selling rain', 'Collecting rainwater', 'Making artificial rain', 'Drinking rain'], correct: 1, difficulty: 'easy' },
    { question: 'Which energy source is NOT renewable?', options: ['Solar', 'Wind', 'Coal', 'Hydroelectric'], correct: 2, difficulty: 'easy' },
  ],
  3: [
    { question: "What percentage of Earth's water is freshwater?", options: ['About 3%', 'About 30%', 'About 50%', 'About 70%'], correct: 0, difficulty: 'medium' },
    { question: 'Which renewable energy source is most used globally?', options: ['Solar', 'Wind', 'Hydropower', 'Geothermal'], correct: 2, difficulty: 'medium' },
    { question: 'What is the main cause of ocean acidification?', options: ['Plastic pollution', 'CO2 absorption', 'Oil spills', 'Overfishing'], correct: 1, difficulty: 'medium' },
    { question: 'Which country produces the most renewable energy?', options: ['USA', 'Germany', 'China', 'Brazil'], correct: 2, difficulty: 'medium' },
    { question: 'What is the ozone layer?', options: ['A type of cloud', 'Protective gas layer', 'Ocean current', 'Mountain range'], correct: 1, difficulty: 'medium' },
  ],
  4: [
    { question: 'What causes the greenhouse effect?', options: ['Too many plants', 'Trapped heat from gases', 'Cold air', 'Ocean waves'], correct: 1, difficulty: 'medium' },
    { question: 'What is the Paris Agreement target for global warming?', options: ['1.5°C', '3°C', '5°C', '0.5°C'], correct: 0, difficulty: 'hard' },
    { question: 'How much plastic enters the ocean annually?', options: ['1 million tons', '8 million tons', '100 million tons', '500 thousand tons'], correct: 1, difficulty: 'hard' },
    { question: 'What percentage of global emissions come from food production?', options: ['10-15%', '26-34%', '5-8%', '50-60%'], correct: 1, difficulty: 'hard' },
    { question: 'Which biome stores the most carbon?', options: ['Tropical rainforest', 'Boreal forest', 'Ocean', 'Grasslands'], correct: 2, difficulty: 'hard' },
  ],
  5: [
    { question: 'What is the estimated number of species that go extinct every day?', options: ['1-5', '10-20', '50-100', '150-200'], correct: 3, difficulty: 'hard' },
    { question: 'What is deforestation?', options: ['Planting new trees', 'Clearing of forests', 'Forest fires', 'Sustainable logging'], correct: 1, difficulty: 'hard' },
    { question: 'What is the main cause of coral bleaching?', options: ['Overfishing', 'Ocean warming', 'Plastic pollution', 'Oil spills'], correct: 1, difficulty: 'hard' },
    { question: 'Which ecosystem is known as the "lungs of the Earth"?', options: ['Coral reefs', 'Deserts', 'Amazon rainforest', 'Arctic tundra'], correct: 2, difficulty: 'hard' },
    { question: 'What causes acid rain?', options: ['Too much oxygen', 'Sulfur dioxide and nitrogen oxides', 'Carbon monoxide', 'Water vapor'], correct: 1, difficulty: 'hard' },
  ],
};

interface LevelConfig {
  level: number;
  questions: Question[];
  timePerQuestion: number;
  targetScore: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, questions: QUESTIONS_BY_LEVEL[1], timePerQuestion: 12, targetScore: 12 },
  { level: 2, questions: QUESTIONS_BY_LEVEL[2], timePerQuestion: 10, targetScore: 15 },
  { level: 3, questions: QUESTIONS_BY_LEVEL[3], timePerQuestion: 10, targetScore: 18 },
  { level: 4, questions: QUESTIONS_BY_LEVEL[4], timePerQuestion: 8, targetScore: 20 },
  { level: 5, questions: QUESTIONS_BY_LEVEL[5], timePerQuestion: 8, targetScore: 22 },
];

const RapidEcoQuiz = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { profile } = useAuth();
  const { playSuccess, playError, playFanfare, playPop } = useGameSounds();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [levelWon, setLevelWon] = useState(false);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    setQuestions([...config.questions].sort(() => Math.random() - 0.5));
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(config.timePerQuestion);
    setLevelWon(false);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing' || showResult) return;

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
  }, [gameState, showResult, currentQuestion]);

  const handleTimeout = () => {
    setStreak(0);
    setShowResult(true);
    setSelectedAnswer(-1);
    if (soundEnabled) playError();
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = index === question.correct;
    const difficultyBonus = question.difficulty === 'hard' ? 3 : question.difficulty === 'medium' ? 2 : 1;
    const timeBonus = Math.ceil(timeLeft / 3);
    
    if (isCorrect) {
      const points = 3 * difficultyBonus + timeBonus + (streak >= 2 ? 2 : 0);
      setScore(score + points);
      setStreak(streak + 1);
      if (streak + 1 > maxStreak) setMaxStreak(streak + 1);
      if (soundEnabled) {
        playSuccess();
        if (streak >= 2) {
          confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
        }
      }
    } else {
      setStreak(0);
      if (soundEnabled) playError();
    }
  };

  const nextQuestion = async () => {
    const config = getLevelConfig();
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(config.timePerQuestion);
    } else {
      finishGame(score);
    }
  };

  const finishGame = async (finalScore: number) => {
    const config = getLevelConfig();
    const won = finalScore >= config.targetScore;
    setLevelWon(won);
    
    await completeGame('rapid-eco-quiz', finalScore);
    
    if (won) {
      if (soundEnabled) {
        playFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      completeLevel('rapid-eco-quiz', selectedLevel, finalScore);
      if (selectedLevel < 5) {
        setShowUnlockAnimation(true);
      }
    }
    
    setGameState('finished');
  };

  const goToNextLevel = () => {
    if (selectedLevel < 5) {
      setSelectedLevel(selectedLevel + 1);
      setTimeout(() => startGame(), 100);
    }
  };

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="rapid-eco-quiz"
        gameTitle="Rapid Eco Quiz ⚡"
        gameDescription="Quick-fire questions with timer!"
        gameIcon={<Zap className="w-6 h-6 text-yellow-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  if (gameState === 'finished') {
    const config = getLevelConfig();
    return (
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-yellow-100 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-auto">
        {/* Background decorations */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-20"
              style={{ left: `${i * 10}%`, top: '-10%' }}
              animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
              transition={{ duration: 15 + i * 2, repeat: Infinity, delay: i * 1.5 }}
            >
              {['⚡', '🌟', '🎯', '🏆', '💡'][i % 5]}
            </motion.div>
          ))}
        </div>

        <LevelUnlockAnimation
          show={showUnlockAnimation}
          level={selectedLevel + 1}
          onComplete={() => setShowUnlockAnimation(false)}
        />
        
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card/95 dark:bg-card backdrop-blur-sm rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <motion.div 
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: levelWon ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.5, repeat: levelWon ? 3 : 0 }}
            >
              {levelWon ? '🏆' : '💪'}
            </motion.div>

            <h2 className="font-display font-bold text-3xl text-foreground mb-2">
              {levelWon ? 'Amazing!' : 'Good Try!'}
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              {levelWon ? 'Lightning fast answers! ⚡' : `Need ${config.targetScore} points to win!`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl p-4">
                <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{score}</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Score ⭐</p>
              </div>
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-2xl p-4">
                <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{maxStreak}</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Best Streak 🔥</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {levelWon && selectedLevel < 5 && (
                <Button 
                  onClick={goToNextLevel}
                  className="w-full py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-bold"
                >
                  <ChevronRight className="w-6 h-6 mr-2" />
                  Next Level (Level {selectedLevel + 1}) 🚀
                </Button>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1 py-6 rounded-2xl">
                  🏠 Menu
                </Button>
                <Button onClick={startGame} className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  {levelWon ? '🔄 Replay' : '🔁 Try Again'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const config = getLevelConfig();
  const timerColor = timeLeft <= 3 ? 'text-red-500' : timeLeft <= 5 ? 'text-yellow-500' : 'text-primary';
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-yellow-100 via-orange-50 to-yellow-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-card/90 dark:bg-card/95 backdrop-blur-md border-b border-border flex-shrink-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setGameState('menu')}
                className="text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  ⚡ Rapid Quiz
                </h1>
                <p className="text-xs text-muted-foreground">Level {selectedLevel} • Q{currentQuestion + 1}/{questions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {streak >= 2 && (
                <div className="bg-orange-100 dark:bg-orange-900/50 px-3 py-1 rounded-full">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm">🔥 {streak}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-foreground"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <div className="bg-primary/10 px-3 py-2 rounded-full">
                <span className="font-bold text-primary text-sm">⭐ {score}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen */}
      <main className="flex-1 flex flex-col p-4 overflow-auto">
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
          {/* Progress bar */}
          <div className="mb-4 flex-shrink-0">
            <div className="bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className={`w-6 h-6 ${timerColor}`} />
              <motion.span 
                className={`text-3xl font-bold ${timerColor}`}
                animate={timeLeft <= 3 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3, repeat: timeLeft <= 3 ? Infinity : 0 }}
              >
                {timeLeft}s
              </motion.span>
            </div>
            <Progress value={(timeLeft / config.timePerQuestion) * 100} className="h-3" />
          </div>

          {/* Question Card - Expanded */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col bg-card dark:bg-card rounded-3xl p-6 shadow-xl"
            >
              {/* Difficulty badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  question.difficulty === 'hard' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                  question.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                  'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                }`}>
                  {question.difficulty.toUpperCase()}
                </span>
                <span className="text-muted-foreground text-sm">
                  +{question.difficulty === 'hard' ? '9' : question.difficulty === 'medium' ? '6' : '3'} base pts
                </span>
              </div>

              {/* Question */}
              <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground mb-6 leading-relaxed">
                {question.question}
              </h2>

              {/* Options */}
              <div className="flex-1 flex flex-col justify-center space-y-3">
                {question.options.map((option, index) => {
                  let buttonStyle = 'border-border hover:border-primary/50 bg-background dark:bg-muted/50';
                  
                  if (showResult) {
                    if (index === question.correct) {
                      buttonStyle = 'border-green-500 bg-green-50 dark:bg-green-900/30';
                    } else if (index === selectedAnswer && selectedAnswer !== question.correct) {
                      buttonStyle = 'border-red-500 bg-red-50 dark:bg-red-900/30';
                    }
                  } else if (selectedAnswer === index) {
                    buttonStyle = 'border-primary bg-primary/10';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${buttonStyle}`}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                    >
                      <span className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="font-medium flex-1 text-foreground text-base sm:text-lg">{option}</span>
                      {showResult && index === question.correct && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                      {showResult && index === selectedAnswer && selectedAnswer !== question.correct && (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Next button */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <Button
                    onClick={nextQuestion}
                    className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question ➡️' : 'See Results 🎯'}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RapidEcoQuiz;
