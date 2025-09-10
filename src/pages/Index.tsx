import Header from "@/components/Header";
import SportCategories from "@/components/SportCategories";
import PlayerPropCard from "@/components/PlayerPropCard";
import BetSlip from "@/components/BetSlip";
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
      isPopular: true
    },
    {
      player: "Stephen Curry",
      team: "Golden State Warriors", 
      stat: "3-Pointers Made",
      line: 4.5,
      overOdds: "-105",
      underOdds: "-115",
      trend: "down" as const,
      isPopular: true
    },
    {
      player: "Giannis Antetokounmpo",
      team: "Milwaukee Bucks",
      stat: "Rebounds",
      line: 11.5,
      overOdds: "+125",
      underOdds: "-145"
    },
    {
      player: "Luka Dončić",
      team: "Dallas Mavericks",
      stat: "Assists",
      line: 8.5,
      overOdds: "-110",
      underOdds: "-110",
      isPopular: true
    },
    {
      player: "Jayson Tatum",
      team: "Boston Celtics",
      stat: "Points",
      line: 26.5,
      overOdds: "+115",
      underOdds: "-135"
    },
    {
      player: "Kevin Durant",
      team: "Phoenix Suns",
      stat: "Points",
      line: 27.5,
      overOdds: "-120",
      underOdds: "+100"
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
                  Player Props
                </span>
                <br />
                <span className="text-foreground">Made Simple</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Bet on your favorite players with the best odds and instant payouts.
              </p>
              <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
                Start Betting Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Props Grid */}
          <div className="lg:col-span-3">
            {/* Popular Props Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">🔥 Popular Props</h2>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {featuredProps.slice(0, 3).map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Today's Games */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">🏀 NBA Player Props</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {featuredProps.map((prop, index) => (
                  <PlayerPropCard key={index} {...prop} />
                ))}
              </div>
            </div>

            {/* Stats Card */}
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Today's Action</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">2,547</p>
                    <p className="text-sm text-muted-foreground">Active Props</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-accent">94%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-positive-odds">$2.1M</p>
                    <p className="text-sm text-muted-foreground">Paid Out</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="lg:col-span-1">
            <BetSlip />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;