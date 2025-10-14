import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b border-border bg-gradient-dark backdrop-blur-md sticky top-0 z-50 h-14">
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-silver bg-clip-text text-transparent tracking-tight">
                ODDIUM
              </span>
            </h1>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">$0.00</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;