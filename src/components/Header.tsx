import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const Header = () => {
  return <header className="border-b border-border bg-gradient-dark backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T.O</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">THE ODDS</h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search players, teams, props..." className="pl-10 bg-secondary border-border" />
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Sign In
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