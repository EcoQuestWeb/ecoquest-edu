import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TreePine, Leaf, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGameProgress } from '@/hooks/useGameProgress';

interface StoryChoice {
  text: string;
  points: number;
  feedback: string;
  isGood: boolean;
}

interface StoryScene {
  id: number;
  title: string;
  narrative: string;
  image: string;
  choices: StoryChoice[];
}

const storyScenes: StoryScene[] = [
  {
    id: 1,
    title: 'The Forest Awakens',
    narrative: 'You are the guardian of Greenwood Forest. One morning, you notice a company wants to build a factory on the forest\'s edge. The mayor asks for your advice.',
    image: '🌲',
    choices: [
      { text: 'Suggest an eco-friendly industrial zone instead', points: 10, feedback: 'Great thinking! Protecting the forest while allowing development.', isGood: true },
      { text: 'Allow the factory - jobs are important', points: 0, feedback: 'Jobs matter, but there might be better solutions for everyone.', isGood: false },
      { text: 'Propose a forest sanctuary with eco-tourism', points: 8, feedback: 'Wonderful! Eco-tourism protects nature and creates jobs.', isGood: true },
    ],
  },
  {
    id: 2,
    title: 'The Water Crisis',
    narrative: 'The forest stream is getting polluted from nearby farmland. Animals are getting sick. You need to act fast!',
    image: '💧',
    choices: [
      { text: 'Plant buffer zones along the stream', points: 10, feedback: 'Perfect! Plants naturally filter pollutants from water.', isGood: true },
      { text: 'Build a concrete wall to block pollution', points: 2, feedback: 'Walls help but can disrupt the ecosystem. Nature-based solutions work better.', isGood: false },
      { text: 'Educate farmers about sustainable practices', points: 8, feedback: 'Education creates lasting change! Great choice.', isGood: true },
    ],
  },
  {
    id: 3,
    title: 'Wildlife in Danger',
    narrative: 'A rare species of owl is losing its habitat due to tree cutting. Locals need firewood for winter. How do you balance both needs?',
    image: '🦉',
    choices: [
      { text: 'Create a protected nesting zone + sustainable firewood program', points: 10, feedback: 'Brilliant! You found a solution that helps both owls and people.', isGood: true },
      { text: 'Ban all tree cutting immediately', points: 3, feedback: 'Protecting wildlife is good, but people need heat too. Balance is key.', isGood: false },
      { text: 'Introduce solar heating as an alternative', points: 8, feedback: 'Innovative! Clean energy reduces pressure on the forest.', isGood: true },
    ],
  },
  {
    id: 4,
    title: 'The Garbage Problem',
    narrative: 'Visitors are leaving trash in the forest. The waste is harming plants and animals. What\'s your plan?',
    image: '🗑️',
    choices: [
      { text: 'Install recycling stations + organize clean-up drives', points: 10, feedback: 'Action plus education - the perfect combination!', isGood: true },
      { text: 'Close the forest to all visitors', points: 2, feedback: 'This protects the forest but loses the chance to teach people.', isGood: false },
      { text: 'Create a "leave no trace" education program', points: 8, feedback: 'Teaching respect for nature creates lasting change!', isGood: true },
    ],
  },
  {
    id: 5,
    title: 'The Forest\'s Future',
    narrative: 'After your efforts, the forest is thriving! The mayor wants to expand your model. What\'s your final recommendation?',
    image: '🌳',
    choices: [
      { text: 'Create a network of connected green spaces', points: 10, feedback: 'Wildlife corridors help species thrive! Visionary thinking.', isGood: true },
      { text: 'Focus only on this forest', points: 3, feedback: 'This forest will thrive, but connected habitats are stronger.', isGood: false },
      { text: 'Train young eco-guardians for every forest', points: 10, feedback: 'Empowering the next generation! The forest\'s future is bright.', isGood: true },
    ],
  },
];

const SaveTheForest = () => {
  const navigate = useNavigate();
  const { completeGame } = useGameProgress();
  const [currentScene, setCurrentScene] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [forestHealth, setForestHealth] = useState(50);

  const scene = storyScenes[currentScene];
  const progress = ((currentScene + 1) / storyScenes.length) * 100;

  const handleChoice = (choice: StoryChoice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);
    setScore(score + choice.points);
    setForestHealth(Math.min(100, Math.max(0, forestHealth + (choice.isGood ? 10 : -5))));
  };

  const handleContinue = async () => {
    if (currentScene < storyScenes.length - 1) {
      setCurrentScene(currentScene + 1);
      setSelectedChoice(null);
      setShowFeedback(false);
    } else {
      await completeGame('save-the-forest', score);
      setGameComplete(true);
    }
  };

  if (gameComplete) {
    const isSuccess = forestHealth >= 70;
    return (
      <div className="min-h-screen gradient-sky leaf-pattern p-4">
        <div className="container mx-auto max-w-lg pt-8">
          <Card className="eco-card text-center animate-scale-in">
            <CardHeader>
              <div className="text-6xl mb-4">{isSuccess ? '🌲🌳🌲' : '🌱'}</div>
              <CardTitle className="font-display text-2xl">
                {isSuccess ? 'Forest Saved!' : 'Keep Learning!'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 rounded-xl p-6">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="text-5xl font-bold text-primary">{score}</p>
                <p className="text-sm text-muted-foreground mt-2">points earned</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Forest Health</span>
                  <span className="font-bold">{forestHealth}%</span>
                </div>
                <Progress value={forestHealth} className="h-3" />
              </div>

              <p className="text-muted-foreground">
                {isSuccess 
                  ? 'Your wise decisions have created a thriving ecosystem! The forest and its community are grateful.'
                  : 'Every choice matters for the environment. Try again to discover better solutions!'}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setCurrentScene(0);
                    setScore(0);
                    setForestHealth(50);
                    setSelectedChoice(null);
                    setShowFeedback(false);
                    setGameComplete(false);
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

  return (
    <div className="min-h-screen gradient-sky leaf-pattern p-4">
      <div className="container mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">🌳 Save the Forest</h1>
            <p className="text-sm text-muted-foreground">Chapter {currentScene + 1} of {storyScenes.length}</p>
          </div>
          <div className="bg-eco-sun/20 px-3 py-2 rounded-full">
            <span className="font-bold text-eco-earth text-sm">{score} pts</span>
          </div>
        </div>

        {/* Forest Health */}
        <div className="mb-4 bg-card rounded-xl p-3 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TreePine className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Forest Health</span>
            </div>
            <span className={`text-sm font-bold ${forestHealth >= 70 ? 'text-green-600' : forestHealth >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
              {forestHealth}%
            </span>
          </div>
          <Progress value={forestHealth} className="h-2" />
        </div>

        {/* Progress */}
        <Progress value={progress} className="mb-6 h-2" />

        {/* Story Card */}
        <Card className="eco-card animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="text-5xl mb-3">{scene.image}</div>
            <CardTitle className="font-display text-lg">{scene.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-center leading-relaxed">
              {scene.narrative}
            </p>

            {showFeedback && selectedChoice ? (
              <div className="space-y-4 animate-fade-in">
                <div className={`p-4 rounded-xl ${selectedChoice.isGood ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start gap-3">
                    {selectedChoice.isGood ? (
                      <Leaf className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    )}
                    <div>
                      <p className={`font-medium ${selectedChoice.isGood ? 'text-green-700' : 'text-yellow-700'}`}>
                        {selectedChoice.isGood ? '+' : ''}{selectedChoice.points} points
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{selectedChoice.feedback}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleContinue}
                  className="w-full gradient-nature text-primary-foreground"
                >
                  {currentScene < storyScenes.length - 1 ? 'Continue Story' : 'See Results'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {scene.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card text-left transition-all hover:shadow-soft"
                  >
                    <span className="font-medium">{choice.text}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SaveTheForest;