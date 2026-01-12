import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Trophy, LogOut, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await signOut();
    toast.success('See you soon, eco-warrior! 🌿');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-sky">
        <div className="animate-pulse text-primary font-display text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-sky leaf-pattern">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-nature flex items-center justify-center shadow-soft">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">EcoQuest</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
              <Trophy className="w-4 h-4 text-eco-sun" />
              <span className="font-semibold text-foreground">{profile.points} pts</span>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <div className="eco-card max-w-2xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-nature shadow-glow mb-6">
            <Sparkles className="w-10 h-10 text-primary-foreground animate-float" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Welcome, {profile.name}! 🌱
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Ready to save the planet, one quest at a time?
          </p>

          {/* Profile Info */}
          <div className="grid grid-cols-2 gap-4 mt-8 text-left">
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">School/College</p>
              <p className="font-semibold text-foreground">{profile.institution}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Class</p>
              <p className="font-semibold text-foreground">Class {profile.class}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-semibold text-foreground">{profile.state}</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-semibold text-foreground">{profile.country}</p>
            </div>
          </div>

          {/* Points Card */}
          <div className="mt-8 p-6 gradient-nature rounded-2xl text-primary-foreground">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-8 h-8" />
              <span className="text-4xl font-bold">{profile.points}</span>
            </div>
            <p className="text-primary-foreground/80">Eco Points</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
