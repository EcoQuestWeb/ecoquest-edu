import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe, Car, Home, Utensils, Check, Droplets, Recycle, Zap, ShoppingBag, Volume2, VolumeX, Leaf, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import { useGameSounds } from '@/hooks/useGameSounds';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  category: string;
  icon: React.ReactNode;
  iconEmoji: string;
  question: string;
  options: { label: string; value: number; emoji: string }[];
}

const QUESTIONS_BY_LEVEL: Record<number, Question[]> = {
  1: [
    { id: 1, category: 'Transportation', icon: <Car className="w-8 h-8" />, iconEmoji: '🚗', question: 'How do you travel to school?', options: [{ label: 'Walk or bike', value: 0, emoji: '🚶' }, { label: 'Bus or train', value: 2, emoji: '🚌' }, { label: 'Carpool', value: 3, emoji: '🚗' }, { label: 'Private car', value: 5, emoji: '🚙' }] },
    { id: 2, category: 'Home Energy', icon: <Home className="w-8 h-8" />, iconEmoji: '🏠', question: 'Do you turn off lights when leaving?', options: [{ label: 'Always!', value: 0, emoji: '💡' }, { label: 'Usually', value: 1, emoji: '😊' }, { label: 'Sometimes', value: 3, emoji: '🤔' }, { label: 'Oops, I forget', value: 5, emoji: '😅' }] },
    { id: 3, category: 'Recycling', icon: <Recycle className="w-8 h-8" />, iconEmoji: '♻️', question: 'Do you recycle?', options: [{ label: 'Everything!', value: 0, emoji: '🌟' }, { label: 'Most things', value: 2, emoji: '👍' }, { label: 'A little bit', value: 4, emoji: '🤷' }, { label: 'Not really', value: 6, emoji: '😬' }] },
  ],
  2: [
    { id: 4, category: 'Food', icon: <Utensils className="w-8 h-8" />, iconEmoji: '🍽️', question: 'How often do you eat meat?', options: [{ label: 'I\'m vegetarian!', value: 0, emoji: '🥬' }, { label: '1-2 times/week', value: 2, emoji: '🥗' }, { label: '3-5 times/week', value: 4, emoji: '🍖' }, { label: 'Every day', value: 6, emoji: '🥩' }] },
    { id: 5, category: 'Water', icon: <Droplets className="w-8 h-8" />, iconEmoji: '💧', question: 'How long are your showers?', options: [{ label: 'Super quick!', value: 0, emoji: '⚡' }, { label: '5-10 mins', value: 2, emoji: '🚿' }, { label: '10-15 mins', value: 4, emoji: '🛁' }, { label: 'Very long', value: 6, emoji: '🌊' }] },
    { id: 6, category: 'Electronics', icon: <Zap className="w-8 h-8" />, iconEmoji: '⚡', question: 'Do you unplug devices?', options: [{ label: 'Always!', value: 0, emoji: '🔌' }, { label: 'Usually', value: 2, emoji: '😊' }, { label: 'Sometimes', value: 4, emoji: '🤔' }, { label: 'Never', value: 6, emoji: '📱' }] },
  ],
  3: [
    { id: 7, category: 'Shopping', icon: <ShoppingBag className="w-8 h-8" />, iconEmoji: '🛍️', question: 'Do you buy second-hand?', options: [{ label: 'Love it!', value: 0, emoji: '🏷️' }, { label: 'Sometimes', value: 2, emoji: '🛒' }, { label: 'Rarely', value: 4, emoji: '🤷' }, { label: 'Never', value: 6, emoji: '🆕' }] },
    { id: 8, category: 'Food Waste', icon: <Utensils className="w-8 h-8" />, iconEmoji: '🥗', question: 'How much food do you waste?', options: [{ label: 'Almost none!', value: 0, emoji: '🌟' }, { label: 'A little', value: 2, emoji: '😊' }, { label: 'Some', value: 4, emoji: '🗑️' }, { label: 'Quite a lot', value: 6, emoji: '😬' }] },
    { id: 9, category: 'Transport', icon: <Car className="w-8 h-8" />, iconEmoji: '✈️', question: 'How often do you fly?', options: [{ label: 'Never', value: 0, emoji: '🚂' }, { label: '1-2/year', value: 3, emoji: '✈️' }, { label: '3-5/year', value: 5, emoji: '🛫' }, { label: 'A lot!', value: 7, emoji: '🌍' }] },
  ],
  4: [
    { id: 10, category: 'Water', icon: <Droplets className="w-8 h-8" />, iconEmoji: '🚿', question: 'Do you save shower water?', options: [{ label: 'Yes, I do!', value: 0, emoji: '💧' }, { label: 'Sometimes', value: 2, emoji: '🤔' }, { label: 'Thinking about it', value: 4, emoji: '💭' }, { label: 'Nope', value: 6, emoji: '🚿' }] },
    { id: 11, category: 'Energy', icon: <Zap className="w-8 h-8" />, iconEmoji: '☀️', question: 'Do you use solar power?', options: [{ label: 'Yes!', value: 0, emoji: '🌞' }, { label: 'A little', value: 2, emoji: '⚡' }, { label: 'Want to', value: 4, emoji: '💡' }, { label: 'No', value: 6, emoji: '🔌' }] },
    { id: 12, category: 'Shopping', icon: <ShoppingBag className="w-8 h-8" />, iconEmoji: '🛒', question: 'Do you bring reusable bags?', options: [{ label: 'Always!', value: 0, emoji: '👜' }, { label: 'Usually', value: 2, emoji: '🛍️' }, { label: 'Sometimes', value: 4, emoji: '📦' }, { label: 'I forget', value: 6, emoji: '🤷' }] },
  ],
  5: [
    { id: 13, category: 'Garden', icon: <TreePine className="w-8 h-8" />, iconEmoji: '🌳', question: 'Do you plant trees?', options: [{ label: 'Yes, many!', value: 0, emoji: '🌲' }, { label: 'A few', value: 2, emoji: '🌱' }, { label: 'Planning to', value: 4, emoji: '💚' }, { label: 'No', value: 6, emoji: '🏙️' }] },
    { id: 14, category: 'Waste', icon: <Recycle className="w-8 h-8" />, iconEmoji: '🍂', question: 'Do you compost?', options: [{ label: 'Yes!', value: 0, emoji: '🌿' }, { label: 'Sometimes', value: 2, emoji: '🍃' }, { label: 'Want to', value: 4, emoji: '🤔' }, { label: 'No', value: 6, emoji: '🗑️' }] },
    { id: 15, category: 'Lifestyle', icon: <Globe className="w-8 h-8" />, iconEmoji: '🌍', question: 'Do you teach others about eco?', options: [{ label: 'Yes, always!', value: 0, emoji: '🎓' }, { label: 'Sometimes', value: 2, emoji: '💬' }, { label: 'A little', value: 4, emoji: '🤷' }, { label: 'Not really', value: 6, emoji: '😶' }] },
  ],
};

interface LevelConfig {
  level: number;
  questions: Question[];
  targetScore: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, questions: QUESTIONS_BY_LEVEL[1], targetScore: 8 },
  { level: 2, questions: QUESTIONS_BY_LEVEL[2], targetScore: 10 },
  { level: 3, questions: QUESTIONS_BY_LEVEL[3], targetScore: 12 },
  { level: 4, questions: QUESTIONS_BY_LEVEL[4], targetScore: 10 },
  { level: 5, questions: QUESTIONS_BY_LEVEL[5], targetScore: 12 },
];

export default function CarbonFootprint() {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playSuccess, playPop, playFanfare } = useGameSounds();
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    setQuestions(config.questions);
    setCurrentQuestion(0);
    setAnswers([]);
    setSelectedOption(null);
    setTotalScore(0);
    setIsAnimating(false);
    setGameState('playing');
  };

  const handleOptionSelect = (value: number) => {
    if (isAnimating) return;
    setSelectedOption(value);
    if (soundEnabled) playPop();
  };

  const handleNext = async () => {
    if (selectedOption === null || isAnimating) return;

    setIsAnimating(true);
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    // Good choice celebration
    if (selectedOption === 0 && soundEnabled) {
      playSuccess();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#10b981'],
      });
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setIsAnimating(false);
      } else {
        const score = newAnswers.reduce((a, b) => a + b, 0);
        setTotalScore(score);
        finishGame(score);
      }
    }, 600);
  };

  const finishGame = async (score: number) => {
    const config = getLevelConfig();
    const maxPossibleScore = config.questions.length * 6;
    const percentage = (maxPossibleScore - score) / maxPossibleScore;
    const pointsEarned = Math.round(10 + percentage * 20);
    
    await completeGame('carbon-footprint', pointsEarned);
    
    // Win if score is below target (lower is better)
    const won = score <= config.targetScore;
    if (won) {
      if (soundEnabled) {
        playFanfare();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
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
    
    if (percentage <= 0.25) return { level: 'Eco Champion!', emoji: '🏆', color: 'from-green-400 to-emerald-500', description: 'You\'re amazing for Earth!' };
    if (percentage <= 0.5) return { level: 'Green Warrior!', emoji: '🌿', color: 'from-lime-400 to-green-500', description: 'Keep up the great work!' };
    if (percentage <= 0.75) return { level: 'Eco Learner!', emoji: '📚', color: 'from-yellow-400 to-orange-400', description: 'You\'re learning well!' };
    return { level: 'Earth Explorer!', emoji: '🌍', color: 'from-orange-400 to-red-400', description: 'Start your green journey!' };
  };

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="carbon-footprint"
        gameTitle="Carbon Quiz 🌍"
        gameDescription="Discover your eco-impact!"
        gameIcon={<Globe className="w-6 h-6 text-teal-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();
  const currentQ = questions[currentQuestion];

  if (gameState === 'finished') {
    const result = getFootprintLevel(totalScore);
    const won = totalScore <= config.targetScore;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-100 via-blue-50 to-green-100 p-4 overflow-hidden">
        {/* Animated background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-30"
              style={{ left: `${i * 10}%`, top: '-10%' }}
              animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
              transition={{ duration: 15 + i * 2, repeat: Infinity, delay: i * 1.5 }}
            >
              {['🌱', '🌿', '🍃', '🌳', '💧'][i % 5]}
            </motion.div>
          ))}
        </div>

        <LevelUnlockAnimation
          show={showUnlockAnimation}
          level={selectedLevel + 1}
          onComplete={() => setShowUnlockAnimation(false)}
        />
        
        <div className="container mx-auto max-w-lg pt-8 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center"
          >
            <motion.div 
              className="text-8xl mb-4"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: won ? [0, -10, 10, 0] : 0,
              }}
              transition={{ duration: 0.6, repeat: won ? 3 : 0 }}
            >
              {result.emoji}
            </motion.div>

            <h2 className={`font-display font-bold text-3xl mb-2 bg-gradient-to-r ${result.color} bg-clip-text text-transparent`}>
              {result.level}
            </h2>
            <p className="text-gray-600 text-lg mb-6">{result.description}</p>
            
            {/* Visual score bar */}
            <div className="bg-gray-100 rounded-full h-6 mb-6 overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${result.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${100 - (totalScore / (config.questions.length * 6)) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-100 rounded-2xl p-4">
                <p className="text-4xl font-bold text-green-600">{totalScore}</p>
                <p className="text-sm text-green-700">Carbon Score</p>
                <p className="text-xs text-green-600">(Lower is better!)</p>
              </div>
              <div className="bg-yellow-100 rounded-2xl p-4">
                <p className="text-4xl font-bold text-yellow-600">
                  +{Math.round(10 + ((config.questions.length * 6 - totalScore) / (config.questions.length * 6)) * 20)}
                </p>
                <p className="text-sm text-yellow-700">Points Earned ⭐</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setGameState('menu')} variant="outline" className="flex-1 py-6 rounded-2xl">
                🏠 Menu
              </Button>
              <Button
                onClick={startGame}
                className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              >
                {won ? '🔄 Play Again!' : '🔁 Try Again!'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 via-blue-50 to-green-100 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-3xl opacity-20"
            style={{ left: `${i * 12}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'] }}
            transition={{ duration: 20 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 2 }}
          >
            {['🌱', '🌿', '💧', '☀️', '🌍', '🌳', '🍃', '💚'][i]}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-green-200 fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setGameState('menu')} className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display font-bold text-lg text-green-800 flex items-center gap-2">
                  🌍 Carbon Quiz
                </h1>
                <p className="text-xs text-green-600">Level {selectedLevel}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-full"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-lg px-4 pt-24 pb-8 relative z-10">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1}/{questions.length}</span>
            <span className="font-bold text-green-600">{Math.round(progress)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ.id}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl"
          >
            {/* Category icon */}
            <motion.div 
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-5xl">{currentQ.iconEmoji}</span>
            </motion.div>
            
            <p className="text-center text-sm text-green-600 font-medium uppercase tracking-wide mb-2">
              {currentQ.category}
            </p>
            <h2 className="text-center font-display font-bold text-xl text-gray-800 mb-6">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(option.value)}
                  className={`w-full p-4 rounded-2xl border-3 text-left transition-all flex items-center gap-4 ${
                    selectedOption === option.value
                      ? 'border-green-500 bg-green-50 shadow-lg scale-[1.02]'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                  whileHover={{ scale: selectedOption === option.value ? 1.02 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="font-medium text-gray-800 flex-1">{option.label}</span>
                  {selectedOption === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Next button */}
            <motion.div className="mt-6">
              <Button
                onClick={handleNext}
                disabled={selectedOption === null || isAnimating}
                className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white disabled:opacity-50"
              >
                {currentQuestion < questions.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    🌟 See Results!
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Eco tip */}
        <motion.div 
          className="mt-6 text-center bg-white/70 rounded-2xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-2xl mr-2">💡</span>
          <span className="text-gray-600 text-sm">Every small choice helps our planet!</span>
        </motion.div>
      </div>
    </div>
  );
}
