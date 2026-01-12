import { useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Header() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('See you soon, eco-warrior! 🌿');
    navigate('/auth');
  };

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-nature flex items-center justify-center shadow-soft">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-display font-bold text-xl text-foreground">EcoQuest</span>
              <span className="text-xl">🌱</span>
            </div>
          </div>

          {/* Right side - User info & logout */}
          <div className="flex items-center gap-3">
            {/* Points badge */}
            <div className="hidden sm:flex items-center gap-2 bg-eco-sun/20 px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-eco-earth" />
              <span className="font-bold text-eco-earth">{profile?.points ?? 0}</span>
              <span className="text-sm text-eco-earth/70">pts</span>
            </div>

            {/* User name */}
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground text-sm max-w-[100px] truncate">
                {profile?.name ?? 'User'}
              </span>
            </div>

            {/* Mobile points */}
            <div className="sm:hidden flex items-center gap-1 bg-eco-sun/20 px-3 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-eco-earth" />
              <span className="font-bold text-eco-earth text-sm">{profile?.points ?? 0}</span>
            </div>

            {/* Logout */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
