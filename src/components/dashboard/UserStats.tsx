import { Trophy, GraduationCap, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function UserStats() {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <div className="eco-card animate-fade-in-up">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl gradient-nature flex items-center justify-center shadow-glow">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">
            Hello, {profile.name}! 👋
          </h2>
          <p className="text-muted-foreground">
            Ready for today's eco-adventure?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Class */}
        <div className="bg-muted/50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-eco-sky/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-eco-forest" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Class</p>
            <p className="font-bold text-lg text-foreground">{profile.class}</p>
          </div>
        </div>

        {/* Points */}
        <div className="bg-gradient-to-br from-eco-sun/20 to-eco-sun/5 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-eco-sun/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-eco-earth" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Points</p>
            <p className="font-bold text-lg text-foreground">{profile.points}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
