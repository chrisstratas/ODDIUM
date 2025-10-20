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
    subtitle: 'Hidden gems in player betting',
    description: 'Sportsbooks focus on main games, leaving player prop lines less refined - your opportunity to find value.',
    icon: <Target className="w-6 h-6" />,
    whyItWorks: 'While books perfect their main game lines, they can\'t analyze every player prop with the same detail. You can use deeper stats to spot when lines don\'t match reality.',
    examples: [
      'Backup running back receiving yards',
      'Bench player rebounds in blowouts',
      'Third-string QB attempts in garbage time',
      'Role player three-pointers vs weak defense'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'High',
    timeCommitment: 'Medium',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'live_betting',
    title: 'Live Betting',
    subtitle: 'React faster than the robots',
    description: 'Game situations change instantly, but sportsbook computers take time to catch up - giving you a window.',
    icon: <Zap className="w-6 h-6" />,
    whyItWorks: 'You\'re watching the game with human intuition while books rely on automated systems. When something big happens, you can often bet before their algorithms fully adjust.',
    examples: [
      'Star player gets injured on the field',
      'Weather suddenly changes the game plan',
      'Key player picks up early fouls',
      'Team momentum that computers miss'
    ],
    difficulty: 'Advanced',
    profitPotential: 'High',
    timeCommitment: 'High',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    id: 'college_sports',
    title: 'College Sports',
    subtitle: 'Where the spotlight doesn\'t shine',
    description: 'Sportsbooks put their best analysts on primetime games, leaving smaller college games with softer lines.',
    icon: <GraduationCap className="w-6 h-6" />,
    whyItWorks: 'Every oddsmaker focuses on the big games everyone\'s watching. Meanwhile, that Tuesday night MAC basketball game? Much less scrutinized, much more opportunity.',
    examples: [
      'Mid-major conference basketball games',
      'Division II football matchups',
      'Early-round conference tournaments',
      'Weekday afternoon college games'
    ],
    difficulty: 'Intermediate',
    profitPotential: 'Medium',
    timeCommitment: 'Medium',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'arbitrage',
    title: 'Line Shopping',
    subtitle: 'Make sportsbooks compete for you',
    description: 'Different sportsbooks often disagree on the same game - find the best price or even guarantee profits.',
    icon: <ArrowLeftRight className="w-6 h-6" />,
    whyItWorks: 'Each sportsbook has different customers and uses different models. When they disagree enough, you can sometimes bet both sides and win either way.',
    examples: [
      'Eagles -3 at one book, Cowboys +3.5 at another',
      'Over 45.5 vs Under 46.5 on the same game',
      'Player props with different numbers',
      'Bonus bets creating arbitrage chances'
    ],
    difficulty: 'Beginner',
    profitPotential: 'Low',
    timeCommitment: 'Medium',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'derivative_markets',
    title: 'Alternative Markets',
    subtitle: 'When sportsbooks use shortcuts',
    description: 'Books often create these lines using simple formulas instead of deep analysis - your chance to outsmart the math.',
    icon: <Split className="w-6 h-6" />,
    whyItWorks: 'Instead of analyzing each market separately, books often just split main game lines in half. But some teams play differently in first halves, or certain periods.',
    examples: [
      'First-half totals (some teams start fast)',
      'Individual team totals (strength vs weakness)',
      'Hockey period betting (teams with strong thirds)',
      'Basketball quarter props (bench depth matters)'
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
          5 Ways Smart Bettors Find Their Edge
        </h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Sportsbooks aren't perfect everywhere. Here's where experienced bettors consistently find opportunities to beat the odds.
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
                      variant="default" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategorySelect(category.id);
                      }}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      View {category.title} Opportunities
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
              Ready to Find Your Opportunities?
            </h3>
          </div>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Our analytics scan these exact categories every day, looking for the mispriced lines and overlooked opportunities 
            that give you the best chance to profit.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Fresh opportunities added daily across all categories</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EdgeCategories;