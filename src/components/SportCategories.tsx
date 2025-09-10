import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const sports = [
  { name: "NBA", icon: "🏀", path: "/" },
  { name: "NFL", icon: "🏈", path: "/nfl" },
  { name: "MLB", icon: "⚾", path: "/mlb" },
  { name: "NHL", icon: "🏒", path: "/nhl" },
  { name: "WNBA", icon: "🏀", path: "/wnba" },
];

interface SportCategoriesProps {
  currentSport?: string;
}

const SportCategories = ({ currentSport }: SportCategoriesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 overflow-x-auto">
          {sports.map((sport) => {
            const isActive = currentSport === sport.name || 
              (sport.path === "/" && location.pathname === "/") ||
              (sport.path !== "/" && location.pathname === sport.path);
            
            return (
              <Button
                key={sport.name}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  isActive 
                    ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                    : "hover:bg-secondary"
                }`}
                onClick={() => navigate(sport.path)}
              >
                <span className="text-lg">{sport.icon}</span>
                <span>{sport.name}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SportCategories;