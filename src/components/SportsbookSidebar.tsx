import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const sports = [
  { name: "Hub", icon: "🎯", path: "/" },
  { name: "NBA", icon: "🏀", path: "/nba" },
  { name: "NFL", icon: "🏈", path: "/nfl" },
  { name: "MLB", icon: "⚾", path: "/mlb" },
  { name: "NHL", icon: "🏒", path: "/nhl" },
  { name: "WNBA", icon: "🏀", path: "/wnba" },
];

const SportsbookSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={`bg-gradient-card border-r border-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      } flex flex-col h-full`}
    >
      {/* Toggle Button */}
      <div className="p-3 border-b border-border flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-muted"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {sports.map((sport) => {
          const isActive = 
            (sport.path === "/" && location.pathname === "/") ||
            (sport.path !== "/" && location.pathname === sport.path);
          
          return (
            <Button
              key={sport.name}
              variant="ghost"
              className={`w-full justify-start ${
                isActive 
                  ? "bg-muted border-l-2 border-primary text-foreground" 
                  : "hover:bg-muted/50 text-muted-foreground"
              }`}
              onClick={() => navigate(sport.path)}
            >
              <span className="text-xl min-w-[24px]">{sport.icon}</span>
              {!collapsed && <span className="ml-3">{sport.name}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-positive-odds animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsbookSidebar;
