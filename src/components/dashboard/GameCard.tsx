import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface GameCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'teal' | 'pink' | 'yellow';
}

const colorClasses = {
  green: 'from-eco-leaf to-primary',
  blue: 'from-eco-sky to-blue-500',
  orange: 'from-eco-sun to-orange-500',
  purple: 'from-purple-400 to-purple-600',
  teal: 'from-teal-400 to-teal-600',
  pink: 'from-pink-400 to-pink-600',
  yellow: 'from-yellow-400 to-yellow-600',
};

const bgColorClasses = {
  green: 'bg-eco-leaf/10',
  blue: 'bg-eco-sky/20',
  orange: 'bg-eco-sun/20',
  purple: 'bg-purple-100',
  teal: 'bg-teal-100',
  pink: 'bg-pink-100',
  yellow: 'bg-yellow-100',
};

export function GameCard({ title, description, icon, path, color }: GameCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="w-full text-left group"
    >
      <div className="eco-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
        {/* Gradient accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />
        
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${bgColorClasses[color]} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Arrow */}
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </button>
  );
}
