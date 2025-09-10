import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BettingInsights from "@/components/BettingInsights";
import ValueFilters from "@/components/ValueFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-sports.jpg";

const Index = () => {
  const featuredProps = [
    {
      player: "LeBron James",
      team: "Los Angeles Lakers",
      stat: "Points",
      line: 25.5,
      overOdds: "+110",
      underOdds: "-130",
      trend: "up" as const,
      isPopular: true,
      confidence: 85,
      valueRating: "high" as const,
      recentForm: "28.2 avg",
      seasonAvg: 25.8,
      hitRate: 72
    },
    {
      player: "Stephen Curry",
      team: "Golden State Warriors", 
      stat: "3-Pointers Made",
      line: 4.5,
      overOdds: "-105",
      underOdds: "-115",
      trend: "up" as const,
      isPopular: true,
      confidence: 78,
      valueRating: "high" as const,
      recentForm: "5.2 avg",
      seasonAvg: 4.1,
      hitRate: 68
    },
    {
      player: "Giannis Antetokounmpo",
      team: "Milwaukee Bucks",
      stat: "Rebounds",
      line: 11.5,
      overOdds: "+125",
      underOdds: "-145",
      confidence: 72,
      valueRating: "medium" as const,
      recentForm: "12.8 avg",
      seasonAvg: 11.2,
      hitRate: 65
    },
    {
      player: "Luka Dončić",
      team: "Dallas Mavericks",
      stat: "Assists",
      line: 8.5,
      overOdds: "-110",
      underOdds: "-110",
      isPopular: true,
      confidence: 80,
      valueRating: "high" as const,
      recentForm: "9.4 avg",
      seasonAvg: 8.8,
      hitRate: 71
    },
    {
      player: "Jayson Tatum",
      team: "Boston Celtics",
      stat: "Points",
      line: 26.5,
      overOdds: "+115",
      underOdds: "-135",
      confidence: 65,
      valueRating: "medium" as const,
      recentForm: "24.8 avg",
      seasonAvg: 26.9,
      hitRate: 58
    },
    {
      player: "Kevin Durant",
      team: "Phoenix Suns",
      stat: "Points",
      line: 27.5,
      overOdds: "-120",
      underOdds: "+100",
      confidence: 88,
      valueRating: "high" as const,
      recentForm: "29.6 avg",
      seasonAvg: 28.1,
      hitRate: 75
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SportCategories />
      
      {/* Hero Section */}
      <section className="relative">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/60" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Find Value
                </span>
                <br />
                <span className="text-foreground">Bet Smarter</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                AI-powered analytics to identify the best player prop opportunities with data-driven insights.
              </p>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Find Value Bets
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ValueFilters />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Insights Section */}
            <div className="mb-8">
              <BettingInsights />
            </div>
            {/* High Value Props */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">⭐ High Value Props</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProps.filter(prop => prop.valueRating === "high").map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* All Props */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏀 Today's NBA Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProps.map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Analytics Dashboard */}
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Today's Analytics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-positive-odds">127</p>
                    <p className="text-sm text-muted-foreground">High Value Props</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">73%</p>
                    <p className="text-sm text-muted-foreground">Avg Confidence</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-warning">+15%</p>
                    <p className="text-sm text-muted-foreground">Expected Edge</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">2,547</p>
                    <p className="text-sm text-muted-foreground">Props Analyzed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;