import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type GameName = 'waste-sorting' | 'eco-puzzle' | 'eco-wordle' | 'environmental-quiz' | 'carbon-footprint' | 'eco-match' | 'save-the-forest' | 'rapid-eco-quiz' | 'ocean-cleanup';

export interface GameLevelProgress {
  currentLevel: number;
  levelsCompleted: number[];
  plantStage: number; // 0: seed, 1: sprout, 2: small plant, 3: medium plant, 4: tree
  totalPoints: number;
}

interface LevelProgressState {
  [gameName: string]: GameLevelProgress;
}

interface LevelProgressContextType {
  getGameProgress: (gameName: GameName) => GameLevelProgress;
  completeLevel: (gameName: GameName, level: number, points: number) => void;
  isLevelUnlocked: (gameName: GameName, level: number) => boolean;
  getPlantStage: (gameName: GameName) => number;
  getTotalTreesGrown: () => number;
  getGlobalStats: () => { totalPoints: number; treesGrown: number; levelsCompleted: number };
  resetProgress: () => void;
}

const LevelProgressContext = createContext<LevelProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'ecoquest_level_progress';

const defaultProgress: GameLevelProgress = {
  currentLevel: 1,
  levelsCompleted: [],
  plantStage: 0,
  totalPoints: 0,
};

export function LevelProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LevelProgressState>({});

  // Load progress from localStorage on mount
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        try {
          setProgress(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse level progress:', e);
        }
      }
    }
  }, [user]);

  // Save progress to localStorage when it changes
  useEffect(() => {
    if (user && Object.keys(progress).length > 0) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(progress));
    }
  }, [progress, user]);

  const getGameProgress = useCallback((gameName: GameName): GameLevelProgress => {
    return progress[gameName] || { ...defaultProgress };
  }, [progress]);

  const completeLevel = useCallback((gameName: GameName, level: number, points: number) => {
    setProgress(prev => {
      const gameProgress = prev[gameName] || { ...defaultProgress };
      const newLevelsCompleted = gameProgress.levelsCompleted.includes(level)
        ? gameProgress.levelsCompleted
        : [...gameProgress.levelsCompleted, level];
      
      // Calculate plant stage based on levels completed
      // 1 level = sprout, 2 levels = small plant, 3 levels = medium plant, 4+ levels = tree
      const plantStage = Math.min(4, newLevelsCompleted.length);
      
      return {
        ...prev,
        [gameName]: {
          currentLevel: Math.max(gameProgress.currentLevel, level + 1),
          levelsCompleted: newLevelsCompleted,
          plantStage,
          totalPoints: gameProgress.totalPoints + points,
        },
      };
    });
  }, []);

  const isLevelUnlocked = useCallback((gameName: GameName, level: number): boolean => {
    if (level === 1) return true;
    const gameProgress = progress[gameName] || defaultProgress;
    return gameProgress.levelsCompleted.includes(level - 1);
  }, [progress]);

  const getPlantStage = useCallback((gameName: GameName): number => {
    const gameProgress = progress[gameName] || defaultProgress;
    return gameProgress.plantStage;
  }, [progress]);

  const getTotalTreesGrown = useCallback((): number => {
    return Object.values(progress).filter(p => p.plantStage >= 4).length;
  }, [progress]);

  const getGlobalStats = useCallback(() => {
    const allProgress = Object.values(progress);
    return {
      totalPoints: allProgress.reduce((sum, p) => sum + p.totalPoints, 0),
      treesGrown: allProgress.filter(p => p.plantStage >= 4).length,
      levelsCompleted: allProgress.reduce((sum, p) => sum + p.levelsCompleted.length, 0),
    };
  }, [progress]);

  const resetProgress = useCallback(() => {
    if (user) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
      setProgress({});
    }
  }, [user]);

  return (
    <LevelProgressContext.Provider 
      value={{
        getGameProgress,
        completeLevel,
        isLevelUnlocked,
        getPlantStage,
        getTotalTreesGrown,
        getGlobalStats,
        resetProgress,
      }}
    >
      {children}
    </LevelProgressContext.Provider>
  );
}

export function useLevelProgress() {
  const context = useContext(LevelProgressContext);
  if (!context) {
    throw new Error('useLevelProgress must be used within a LevelProgressProvider');
  }
  return context;
}
