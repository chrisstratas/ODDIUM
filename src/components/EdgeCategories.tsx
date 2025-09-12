import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Zap, 
  GraduationCap, 
  ArrowLeftRight, 
  Split,
  TrendingUp,
  Eye,
  Clock,
  Lightbulb,
  ChevronRight,
  Info
} from 'lucide-react';

interface EdgeCategory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  whyItWorks: string;
  examples: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  profitPotential: 'Low' | 'Medium' | 'High';
  timeCommitment: 'Low' | 'Medium' | 'High';
  color: string;
}

const edgeCategories: EdgeCategory[] = [
  {
    id: 'player_props',
    title: 'Player Props',
    subtitle: 'Especially niche ones',
    description: 'Sportsbooks lack depth of data and liquidity in props compared to spreads/totals.',
    icon: <Target className="w-6 h-6" />,
    whyItWorks: 'Books can\'t devote the same resources to every prop. Advanced stat tracking (targets, snap counts, usage rates) reveals mispriced lines.',
    examples: [
      'NFL backup RB receiving yards',
      'NBA bench player rebounds',
      'Backup QB passing attempts',
      'Role player 3-pointers made'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'High',
    timeCommitment: 'Medium',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'live_betting',
    title: 'Live/In-Play Betting',
    subtitle: 'Fast-moving opportunities',
    description: 'Lines update quickly based on automated models. Sharp eyes can beat sluggish adjustments.',
    icon: <Zap className="w-6 h-6" />,
    whyItWorks: 'Automated models can\'t instantly process all game context. Bettors with faster data or sharp observation can spot mispriced live lines.',
    examples: [
      'QB injury before line adjusts',
      'Weather changes mid-game',
      'Key player fouls out',
      'Momentum shifts books miss'
    ],
    difficulty: 'Advanced',
    profitPotential: 'High',
    timeCommitment: 'High',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 'college_sports',
    title: 'College Sports',
    subtitle: 'Smaller conferences',
    description: 'Books can\'t perfect lines for every conference. Less attention = more opportunity.',
    icon: <GraduationCap className="w-6 h-6" />,
    whyItWorks: 'Resources focused on major games. Sun Belt basketball gets less attention than NFL Sunday Night Football.',
    examples: [
      'Mid-major basketball totals',
      'FCS football spreads',
      'Conference tournament games',
      'Weekday college games'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'Medium',
    timeCommitment: 'Medium',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'arbitrage',
    title: 'Arbitrage & Line Shopping',
    subtitle: 'Cross-book opportunities',
    description: 'Different books disagree on odds. Lock in profits by betting both sides.',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    whyItWorks: 'Books use different models and have different customer bases. Price discrepancies create guaranteed profit opportunities.',
    examples: [
      'Eagles -3 vs Cowboys +3.5',
      'Over 45.5 vs Under 46.5',
      'Different prop lines',
      'Promotional boosts arbitrage'
    ],
    difficulty: 'Beginner',
    profitPotential: 'Low',
    timeCommitment: 'Medium',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'derivative_markets',
    title: 'Derivative Markets',
    subtitle: 'First-half, team totals, periods',
    description: 'Books often set these by formula, missing game-specific nuances.',
    icon: <Split className="w-6 h-6" />,
    whyItWorks: 'Automatic splitting of main lines misses context like fast first halves in NBA or strong third quarters.',
    examples: [
      'First-half totals',
      'Team-specific totals',
      'Period betting (hockey)',
      'Quarter props (basketball)'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'Medium',
    timeCommitment: 'Low',
    color: 'bg-red-100 text-red-800 border-red-200'
  }
];

interface EdgeCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string;
}

const EdgeCategories: React.FC<EdgeCategoriesProps> = ({ 
  onCategorySelect, 
  selectedCategory 
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPotentialColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Where Bettors Beat the House
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Focus your edge-hunting on these five proven categories where sharp bettors consistently find value against sportsbooks.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {edgeCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`bg-gradient-card border-border hover:shadow-glow transition-all duration-300 cursor-pointer ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              onCategorySelect?.(category.id);
              setExpandedCategory(
                expandedCategory === category.id ? null : category.id
              );
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {category.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {category.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                    expandedCategory === category.id ? 'rotate-90' : ''
                  }`} 
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {category.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getDifficultyColor(category.difficulty)}>
                  {category.difficulty}
                </Badge>
                <Badge variant="outline" className={getPotentialColor(category.profitPotential)}>
                  {category.profitPotential} Profit
                </Badge>
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {category.timeCommitment} Time
                </Badge>
              </div>

              {/* Expanded Content */}
              {expandedCategory === category.id && (
                <div className="mt-4 space-y-4 border-t border-border pt-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Why It Works</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {category.whyItWorks}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Examples</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {category.examples.map((example, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-primary rounded-full"></span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {onCategorySelect && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategorySelect(category.id);
                      }}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Find {category.title} Edges
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-subtle border-border">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Start Your Edge Hunt
            </h3>
          </div>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Our analytics focus on these proven edge categories. Each prop is analyzed for niche opportunities, 
            live betting potential, and cross-book value.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Updated daily with fresh opportunities in all five categories</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeCategories;