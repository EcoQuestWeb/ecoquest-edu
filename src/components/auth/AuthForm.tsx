import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, School, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  institution: z.string().min(2, 'Institution name is required').max(200),
  classLevel: z.string().min(1, 'Please select your class'),
  gender: z.string().min(1, 'Please select your gender'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().min(2, 'Country is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => {
  const classNum = parseInt(data.classLevel);
  if (classNum >= 10 && (!data.email || data.email === '')) {
    return false;
  }
  return true;
}, {
  message: 'Email is required for class 10 and above',
  path: ['email'],
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignUpForm = z.infer<typeof signUpSchema>;
type SignInForm = z.infer<typeof signInSchema>;

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      institution: '',
      classLevel: '',
      gender: '',
      email: '',
      state: '',
      country: '',
      password: '',
    },
  });

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const classLevel = signUpForm.watch('classLevel');
  const showEmailField = parseInt(classLevel) >= 10;

  const handleSignUp = async (data: SignUpForm) => {
    setIsLoading(true);
    try {
      // For younger students, generate a placeholder email for auth
      const authEmail = showEmailField && data.email 
        ? data.email 
        : `${data.name.toLowerCase().replace(/\s+/g, '')}_${Date.now()}@ecoquest.student`;
      
      const { error } = await signUp(authEmail, data.password, {
        name: data.name,
        institution: data.institution,
        class: parseInt(data.classLevel),
        gender: data.gender,
        email: showEmailField ? data.email || null : null,
        state: data.state,
        country: data.country,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('An account with this email already exists. Please sign in.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome to EcoQuest! 🌱');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: SignInForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back! 🌿');
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo and Title */}
      <div className="text-center mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">🌱 EcoQuest</h1>
        <p className="text-muted-foreground">
          {isSignUp ? 'Join the eco-warriors!' : 'Welcome back, eco-warrior!'}
        </p>
      </div>

      {/* Auth Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-2xl mb-6 animate-scale-in">
        <button
          onClick={() => setIsSignUp(true)}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            isSignUp
              ? 'bg-card shadow-soft text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign Up
        </button>
        <button
          onClick={() => setIsSignUp(false)}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            !isSignUp
              ? 'bg-card shadow-soft text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Forms */}
      <div className="eco-card animate-scale-in">
        {isSignUp ? (
          <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Enter your name"
                  className="pl-10"
                  {...signUpForm.register('name')}
                />
              </div>
              {signUpForm.formState.errors.name && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Institution */}
            <div className="space-y-2">
              <Label htmlFor="institution" className="text-sm font-medium">
                School / College
              </Label>
              <div className="relative">
                <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="institution"
                  placeholder="Enter your school or college"
                  className="pl-10"
                  {...signUpForm.register('institution')}
                />
              </div>
              {signUpForm.formState.errors.institution && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.institution.message}</p>
              )}
            </div>

            {/* Class */}
            <div className="space-y-2">
              <Label htmlFor="class" className="text-sm font-medium">
                Class
              </Label>
              <Select
                value={signUpForm.watch('classLevel')}
                onValueChange={(value) => signUpForm.setValue('classLevel', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Class {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {signUpForm.formState.errors.classLevel && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.classLevel.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={signUpForm.watch('gender')}
                onValueChange={(value) => signUpForm.setValue('gender', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
              {signUpForm.formState.errors.gender && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.gender.message}</p>
              )}
            </div>

            {/* Email - Only for class 10+ */}
            {showEmailField && (
              <div className="space-y-2 animate-fade-in-up">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signUpForm.register('email')}
                  />
                </div>
                {signUpForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>
                )}
              </div>
            )}

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state" className="text-sm font-medium">
                State
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="state"
                  placeholder="Enter your state"
                  className="pl-10"
                  {...signUpForm.register('state')}
                />
              </div>
              {signUpForm.formState.errors.state && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.state.message}</p>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium">
                Country
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="country"
                  placeholder="Enter your country"
                  className="pl-10"
                  {...signUpForm.register('country')}
                />
              </div>
              {signUpForm.formState.errors.country && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.country.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-10"
                  {...signUpForm.register('password')}
                />
              </div>
              {signUpForm.formState.errors.password && (
                <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-nature hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Join EcoQuest 🌱'}
            </Button>
          </form>
        ) : (
          <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="signin-email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...signInForm.register('email')}
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="text-sm text-destructive">{signInForm.formState.errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="signin-password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  {...signInForm.register('password')}
                />
              </div>
              {signInForm.formState.errors.password && (
                <p className="text-sm text-destructive">{signInForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-nature hover:opacity-90 transition-opacity text-primary-foreground font-semibold py-6 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In 🌿'}
            </Button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in-up">
        {isSignUp
          ? 'Already have an account? '
          : "Don't have an account? "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-primary font-semibold hover:underline"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}
