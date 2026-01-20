import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { RunnerBackground, RunningAvatar } from '@/components/runner';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <RunnerBackground>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <RunningAvatar size="lg" isRunning={true} />
          <motion.div 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-primary font-display text-xl"
          >
            Preparing your eco-adventure...
          </motion.div>
        </div>
      </RunnerBackground>
    );
  }

  return (
    <RunnerBackground showGround={false}>
      <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 overflow-x-hidden relative z-10">
        {/* Animated welcome runner */}
        <motion.div
          className="fixed top-20 sm:top-32"
          initial={{ x: '-100vw' }}
          animate={{ x: '100vw' }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <span className="text-4xl">🏃‍♂️</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <AuthForm />
        </motion.div>
      </div>
    </RunnerBackground>
  );
}
