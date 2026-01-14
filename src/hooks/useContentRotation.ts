import { useState, useCallback, useRef } from 'react';

/**
 * Hook for content rotation that prevents repetition across game sessions.
 * Maintains a pool of available content and shuffles when exhausted.
 */
export function useContentRotation<T>(
  contentPool: T[],
  itemsPerRound: number = contentPool.length
) {
  const usedIndicesRef = useRef<Set<number>>(new Set());
  const [availableContent, setAvailableContent] = useState<T[]>(() => {
    return shuffleArray([...contentPool]);
  });

  const shuffleArray = useCallback(<U>(array: U[]): U[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const getNextBatch = useCallback((count: number = itemsPerRound): T[] => {
    let available = [...availableContent];
    
    // If not enough content available, refill the pool
    if (available.length < count) {
      // Combine remaining with shuffled full pool (excluding recently used)
      const recentlyUsed = Array.from(usedIndicesRef.current);
      const freshPool = contentPool.filter((_, idx) => !recentlyUsed.includes(idx));
      const shuffledFresh = shuffleArray(freshPool.length > 0 ? freshPool : [...contentPool]);
      available = [...available, ...shuffledFresh];
      usedIndicesRef.current.clear();
    }

    // Take the required count
    const batch = available.slice(0, count);
    const remaining = available.slice(count);
    
    // Track used indices
    batch.forEach((item) => {
      const originalIndex = contentPool.findIndex(c => c === item);
      if (originalIndex !== -1) {
        usedIndicesRef.current.add(originalIndex);
      }
    });

    // Keep track of what's left
    setAvailableContent(remaining.length > 0 ? remaining : shuffleArray([...contentPool]));
    
    // Return shuffled batch for extra randomness
    return shuffleArray(batch);
  }, [availableContent, contentPool, itemsPerRound, shuffleArray]);

  const resetPool = useCallback(() => {
    usedIndicesRef.current.clear();
    setAvailableContent(shuffleArray([...contentPool]));
  }, [contentPool, shuffleArray]);

  return { getNextBatch, resetPool, shuffleArray };
}

/**
 * Simpler version that just ensures no back-to-back repetition
 */
export function useSimpleRotation<T>(contentPool: T[]) {
  const lastUsedRef = useRef<T | null>(null);

  const shuffleArray = useCallback(<U>(array: U[]): U[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const getRandomItem = useCallback((): T => {
    const available = contentPool.filter(item => item !== lastUsedRef.current);
    const pool = available.length > 0 ? available : contentPool;
    const shuffled = shuffleArray(pool);
    const selected = shuffled[0];
    lastUsedRef.current = selected;
    return selected;
  }, [contentPool, shuffleArray]);

  const getShuffledBatch = useCallback((count: number): T[] => {
    const shuffled = shuffleArray([...contentPool]);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, [contentPool, shuffleArray]);

  return { getRandomItem, getShuffledBatch, shuffleArray };
}
