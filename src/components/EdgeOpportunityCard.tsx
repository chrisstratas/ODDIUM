import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpportunityAIChat } from './OpportunityAIChat';
import { 
  Target, 
  Zap, 
  GraduationCap, 
  ArrowLeftRight, 
  Split,
  Clock,
  TrendingUp,
  AlertTriangle,
  Star,
  MessageSquare
} from 'lucide-react';

interface EdgeOpportunity {
  id: string;
  category: 'player_props' | 'live_betting' | 'college_sports' | 'arbitrage' | 'derivative_markets';
  title: string;
  description: string;
  player?: string;
  team?: string;
  sport?: string;
  edge: number;
  confidence: number;
  timeToAct?: string; // For live betting
  books?: string[]; // For arbitrage
  reasoning: string;
  urgency: 'low' | 'medium' | 'high';
}

interface EdgeOpportunityCardProps {
  opportunity: EdgeOpportunity;
  onExplore?: () => void;
}

const EdgeOpportunityCard: React.FC<EdgeOpportunityCardProps> = ({
  opportunity,
  onExplore
}) => {
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const getCategoryData = (category: string) => {
    const categories = {
      player_props: {
        title: 'Player Props',
        whyItWorks: 'While books perfect their main game lines, they can\'t analyze every player prop with the same detail. You can use deeper stats to spot when lines don\'t match reality.'
      },
      live_betting: {
        title: 'Live Betting',
        whyItWorks: 'You\'re watching the game with human intuition while books rely on automated systems. When something big happens, you can often bet before their algorithms fully adjust.'
      },
      college_sports: {
        title: 'College Sports',
        whyItWorks: 'Every oddsmaker focuses on the big games everyone\'s watching. Meanwhile, that Tuesday night MAC basketball game? Much less scrutinized, much more opportunity.'
      },
      arbitrage: {
        title: 'Line Shopping',
        whyItWorks: 'Each sportsbook has different customers and uses different models. When they disagree enough, you can sometimes bet both sides and win either way.'
      },
      derivative_markets: {
        title: 'Alternative Markets',
        whyItWorks: 'Instead of analyzing each market separately, books often just split main game lines in half. But some teams play differently in first halves, or certain periods.'
      }
    };
    return categories[category as keyof typeof categories] || categories.player_props;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'player_props': return <Target className="w-4 h-4" />;
      case 'live_betting': return <Zap className="w-4 h-4" />;
      case 'college_sports': return <GraduationCap className="w-4 h-4" />;
      case 'arbitrage': return <ArrowLeftRight className="w-4 h-4" />;
      case 'derivative_markets': return <Split className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'player_props': return 'Niche Props';
      case 'live_betting': return 'Live Edge';
      case 'college_sports': return 'College Value';
      case 'arbitrage': return 'Arbitrage';
      case 'derivative_markets': return 'Derivative';
      default: return 'Edge';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'player_props': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'live_betting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'college_sports': return 'bg-green-100 text-green-800 border-green-200';
      case 'arbitrage': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'derivative_markets': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-3 h-3" />;
      case 'medium': return <Clock className="w-3 h-3" />;
      case 'low': return <Star className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300 ease-out hover:-translate-y-1 rounded-xl animate-slide-fade-in">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge 
                variant="outline" 
                className={`${getCategoryColor(opportunity.category)} flex items-center gap-1`}
              >
                {getCategoryIcon(opportunity.category)}
                {getCategoryLabel(opportunity.category)}
              </Badge>
              <Badge 
                variant="outline" 
                className={`${getUrgencyColor(opportunity.urgency)} flex items-center gap-1`}
              >
                {getUrgencyIcon(opportunity.urgency)}
                {opportunity.urgency}
              </Badge>
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {opportunity.title}
            </h3>
            {opportunity.player && (
              <p className="text-sm text-muted-foreground">
                {opportunity.player} • {opportunity.team} • {opportunity.sport}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-positive-odds">
              +{opportunity.edge.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">
              {opportunity.confidence}% conf.
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {opportunity.description}
        </p>

        {/* Special Info */}
        {opportunity.timeToAct && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Time to act: {opportunity.timeToAct}
            </span>
          </div>
        )}

        {opportunity.books && opportunity.books.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Books:</span>
            {opportunity.books.map((book, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {book}
              </Badge>
            ))}
          </div>
        )}

        {/* Reasoning */}
        <div className="p-3 bg-gradient-subtle rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Why This Edge Exists</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {opportunity.reasoning}
          </p>
        </div>

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => setAiChatOpen(true)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Ask AI About This Edge
        </Button>
      </CardContent>
      
      <OpportunityAIChat
        opportunity={opportunity}
        category={getCategoryData(opportunity.category)}
        open={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
      />
    </Card>
  );
};

export default EdgeOpportunityCard;