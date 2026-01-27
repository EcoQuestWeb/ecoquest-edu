import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, RotateCcw, Check, X, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useGameProgress } from '@/hooks/useGameProgress';
import { useLevelProgress } from '@/contexts/LevelProgressContext';
import { GameEntryScreen } from '@/components/progression/GameEntryScreen';
import { LevelUnlockAnimation } from '@/components/progression/LevelUnlockAnimation';
import { useGameSounds } from '@/hooks/useGameSounds';
import confetti from 'canvas-confetti';

const QUESTIONS_BY_LEVEL: Record<number, Array<{ question: string; options: string[]; correct: number }>> = {
  1: [
    { question: "What is the main greenhouse gas responsible for global warming?", options: ["Oxygen (O₂)", "Carbon Dioxide (CO₂)", "Nitrogen (N₂)", "Helium (He)"], correct: 1 },
    { question: "What percentage of Earth's water is freshwater?", options: ["About 97%", "About 50%", "About 3%", "About 25%"], correct: 2 },
    { question: "Which layer of the atmosphere contains the ozone layer?", options: ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], correct: 1 },
    { question: "What is the largest source of ocean pollution?", options: ["Oil spills", "Land-based runoff", "Ship waste", "Fishing nets"], correct: 1 },
    { question: "Which renewable energy source generates the most electricity globally?", options: ["Solar", "Wind", "Hydropower", "Geothermal"], correct: 2 },
  ],
  2: [
    { question: "What is biodiversity?", options: ["Number of humans", "Variety of life forms", "Amount of water", "Size of forests"], correct: 1 },
    { question: "What does 'carbon footprint' measure?", options: ["Shoe size", "CO₂ emissions", "Walking distance", "Carbon in soil"], correct: 1 },
    { question: "Which gas makes up about 78% of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"], correct: 2 },
    { question: "What is the greenhouse effect?", options: ["Plants growing in greenhouses", "Heat trapped by atmospheric gases", "Green-colored light from the sun", "Cooling of the atmosphere"], correct: 1 },
    { question: "Which ecosystem is known as the 'lungs of the Earth'?", options: ["Coral reefs", "Deserts", "Amazon rainforest", "Arctic tundra"], correct: 2 },
  ],
  3: [
    { question: "What causes acid rain?", options: ["Too much oxygen", "Sulfur dioxide and nitrogen oxides", "Carbon monoxide", "Water vapor"], correct: 1 },
    { question: "How much of Earth's surface is covered by water?", options: ["About 50%", "About 60%", "About 71%", "About 85%"], correct: 2 },
    { question: "What is the main cause of coral bleaching?", options: ["Overfishing", "Ocean warming", "Plastic pollution", "Oil spills"], correct: 1 },
    { question: "Which type of energy comes from the heat inside the Earth?", options: ["Solar", "Wind", "Geothermal", "Hydroelectric"], correct: 2 },
    { question: "What is deforestation?", options: ["Planting new trees", "Clearing of forests", "Forest fires", "Sustainable logging"], correct: 1 },
  ],
  4: [
    { question: "What is the Paris Agreement target for global warming?", options: ["1.5°C", "3°C", "5°C", "0.5°C"], correct: 0 },
    { question: "How much plastic enters the ocean annually?", options: ["1 million tons", "8 million tons", "100 million tons", "500 thousand tons"], correct: 1 },
    { question: "What percentage of global emissions come from food production?", options: ["10-15%", "26-34%", "5-8%", "50-60%"], correct: 1 },
    { question: "Which biome stores the most carbon?", options: ["Tropical rainforest", "Boreal forest", "Ocean", "Grasslands"], correct: 2 },
    { question: "What is the estimated number of species that go extinct every day?", options: ["1-5", "10-20", "50-100", "150-200"], correct: 3 },
  ],
  5: [
    { question: "What is the primary cause of rising sea levels?", options: ["Earthquakes", "Thermal expansion and ice melt", "Ocean currents", "Tidal forces"], correct: 1 },
    { question: "Which renewable energy has the highest growth rate globally?", options: ["Hydropower", "Wind", "Solar", "Biomass"], correct: 2 },
    { question: "What is the term for species that exist only in one geographic location?", options: ["Invasive species", "Migratory species", "Endemic species", "Keystone species"], correct: 2 },
    { question: "What percentage of Earth's species are estimated to be at risk of extinction?", options: ["About 5%", "About 15%", "About 25%", "About 40%"], correct: 2 },
    { question: "What is the main driver of habitat loss globally?", options: ["Climate change", "Agriculture expansion", "Mining", "Urban development"], correct: 1 },
  ],
};

interface LevelConfig {
  level: number;
  questions: Array<{ question: string; options: string[]; correct: number }>;
  targetScore: number;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  { level: 1, questions: QUESTIONS_BY_LEVEL[1], targetScore: 3 },
  { level: 2, questions: QUESTIONS_BY_LEVEL[2], targetScore: 3 },
  { level: 3, questions: QUESTIONS_BY_LEVEL[3], targetScore: 3 },
  { level: 4, questions: QUESTIONS_BY_LEVEL[4], targetScore: 4 },
  { level: 5, questions: QUESTIONS_BY_LEVEL[5], targetScore: 4 },
];

export default function EnvironmentalQuiz() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { completeGame } = useGameProgress();
  const { completeLevel, isLevelUnlocked } = useLevelProgress();
  const { playSuccess, playError, playFanfare } = useGameSounds();

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [questions, setQuestions] = useState<typeof QUESTIONS_BY_LEVEL[1]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [levelWon, setLevelWon] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    // Redirect if not class 10+
    if (!loading && profile && profile.class < 10) {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const getLevelConfig = () => LEVEL_CONFIGS[selectedLevel - 1] || LEVEL_CONFIGS[0];

  const startGame = () => {
    const config = getLevelConfig();
    setQuestions([...config.questions].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setLevelWon(false);
    setGameState('playing');
  };

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);

    if (index === currentQuestion.correct) {
      setScore(prev => prev + 1);
      if (soundEnabled) {
        playSuccess();
        confetti({ particleCount: 30, spread: 40, origin: { y: 0.7 } });
      }
    } else {
      if (soundEnabled) playError();
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        finishGame(index === currentQuestion.correct ? score + 1 : score);
      }
    }, 1500);
  };

  const finishGame = async (finalScore: number) => {
    setGameState('finished');
    setIsSaving(true);

    const config = getLevelConfig();
    const won = finalScore >= config.targetScore;
    setLevelWon(won);

    // 5 points per correct answer for advanced quiz
    const pointsEarned = finalScore * 5;

    if (won && soundEnabled) {
      playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    if (pointsEarned > 0) {
      await completeGame('environmental-quiz', pointsEarned);
      
      if (won) {
        completeLevel('environmental-quiz', selectedLevel, pointsEarned);
        if (selectedLevel < 5) {
          setShowUnlockAnimation(true);
        }
      }
    }

    setIsSaving(false);
  };

  const goToNextLevel = () => {
    if (selectedLevel < 5) {
      setSelectedLevel(selectedLevel + 1);
      setTimeout(() => startGame(), 100);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl"
        >
          🧠
        </motion.div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <GameEntryScreen
        gameName="environmental-quiz"
        gameTitle="Environmental Quiz 🧠"
        gameDescription="Advanced science questions!"
        gameIcon={<Brain className="w-6 h-6 text-purple-500" />}
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        onStartGame={startGame}
        totalLevels={5}
      />
    );
  }

  const config = getLevelConfig();

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-20"
            style={{ left: `${10 + i * 12}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
            transition={{ duration: 20 + i * 3, repeat: Infinity, ease: 'linear', delay: i * 2 }}
          >
            {['🧠', '🌍', '📚', '⚗️', '🔬', '🌿', '💡', '🎓'][i]}
          </motion.div>
        ))}
      </div>

      <LevelUnlockAnimation
        show={showUnlockAnimation}
        level={selectedLevel + 1}
        onComplete={() => setShowUnlockAnimation(false)}
      />

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
                  🧠 Environmental Quiz
                </h1>
                <p className="text-xs text-muted-foreground">Level {selectedLevel} • Advanced Challenge</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-foreground"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {gameState === 'playing' && (
                <div className="bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-full">
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">{currentIndex + 1}/{questions.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-auto relative z-10">
        {gameState === 'playing' && currentQuestion ? (
          <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
            {/* Progress bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-6">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question */}
            <motion.div 
              className="flex-1 flex flex-col bg-card dark:bg-card rounded-3xl p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="font-display font-bold text-lg text-foreground leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="flex-1 flex flex-col justify-center space-y-3">
                {currentQuestion.options.map((option, index) => {
                  let optionClass = 'bg-muted hover:bg-muted/80 border-2 border-transparent';
                  
                  if (showResult) {
                    if (index === currentQuestion.correct) {
                      optionClass = 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500';
                    } else if (index === selectedAnswer && index !== currentQuestion.correct) {
                      optionClass = 'bg-red-100 dark:bg-red-900/30 border-2 border-red-500';
                    }
                  } else if (selectedAnswer === index) {
                    optionClass = 'bg-purple-100 dark:bg-purple-900/50 border-2 border-purple-500';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${optionClass}`}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                    >
                      <span className="w-10 h-10 rounded-lg bg-card dark:bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1 text-foreground font-medium">{option}</span>
                      {showResult && index === currentQuestion.correct && (
                        <Check className="w-6 h-6 text-green-600" />
                      )}
                      {showResult && index === selectedAnswer && index !== currentQuestion.correct && (
                        <X className="w-6 h-6 text-red-600" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        ) : gameState === 'finished' && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card dark:bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-xl"
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: levelWon ? [0, -10, 10, 0] : 0,
                }}
                transition={{ duration: 0.5, repeat: levelWon ? 3 : 0 }}
              >
                {levelWon ? '🏆' : '📚'}
              </motion.div>

              <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                {levelWon ? 'Brilliant!' : 'Keep Learning!'}
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                {levelWon ? 'You\'re an eco-genius! 🧠✨' : `Need ${config.targetScore}/${questions.length} to pass!`}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-2xl p-4">
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{score}/{questions.length}</p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Correct ✅</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl p-4">
                  <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">+{score * 5}</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Points ⭐</p>
                </div>
              </div>

              {isSaving ? (
                <p className="text-muted-foreground">Saving progress... 🧠</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {levelWon && selectedLevel < 5 && (
                    <Button 
                      onClick={goToNextLevel}
                      className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-lg font-bold"
                    >
                      <ChevronRight className="w-6 h-6 mr-2" />
                      Next Level (Level {selectedLevel + 1}) 🚀
                    </Button>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setGameState('menu')} className="flex-1 py-6 rounded-2xl">
                      🏠 Menu
                    </Button>
                    <Button onClick={startGame} className="flex-1 py-6 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {levelWon ? 'Replay' : 'Try Again'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}
