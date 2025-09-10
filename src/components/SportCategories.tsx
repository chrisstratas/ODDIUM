import { Button } from "@/components/ui/button";

const sports = [
  { name: "NBA", icon: "🏀", active: true },
  { name: "NFL", icon: "🏈", active: false },
  { name: "MLB", icon: "⚾", active: false },
  { name: "NHL", icon: "🏒", active: false },
  { name: "WNBA", icon: "🏀", active: false },
];

const SportCategories = () => {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 overflow-x-auto">
          {sports.map((sport) => (
            <Button
              key={sport.name}
              variant={sport.active ? "default" : "ghost"}
              size="sm"
              className={`flex items-center space-x-2 whitespace-nowrap ${
                sport.active 
                  ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                  : "hover:bg-secondary"
              }`}
            >
              <span className="text-lg">{sport.icon}</span>
              <span>{sport.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SportCategories;