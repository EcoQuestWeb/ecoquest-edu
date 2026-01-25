import { useCallback, useRef } from 'react';

// Simple sound effects using Web Audio API
export function useGameSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Celebration sound - happy ascending notes
  const playSuccess = useCallback(() => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  // Soft buzz for wrong answers
  const playError = useCallback(() => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  // Pop sound for collecting items
  const playPop = useCallback(() => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  // Splash sound for ocean game
  const playSplash = useCallback(() => {
    try {
      const ctx = getContext();
      const bufferSize = ctx.sampleRate * 0.2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      
      source.start(ctx.currentTime);
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  // Level complete fanfare
  const playFanfare = useCallback(() => {
    try {
      const ctx = getContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
        gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.15 + 0.05);
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        
        oscillator.start(ctx.currentTime + i * 0.15);
        oscillator.stop(ctx.currentTime + i * 0.15 + 0.35);
      });
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  // Match sound for bubble shooter
  const playMatch = useCallback(() => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      oscillator.frequency.setValueAtTime(900, ctx.currentTime + 0.05);
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.01, ctx.currentTime + 0.2);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.log('Sound not available');
    }
  }, [getContext]);

  return {
    playSuccess,
    playError,
    playPop,
    playSplash,
    playFanfare,
    playMatch,
  };
}
