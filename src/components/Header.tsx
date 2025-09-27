import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import PlayerNameInput from "./PlayerNameInput";
const Header = () => {
  return <header className="border-b border-border bg-gradient-dark backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">ODDIUM</h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <PlayerNameInput 
              placeholder="Search players, teams, props..." 
              className="bg-secondary border-border"
              sport="All"
            />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;