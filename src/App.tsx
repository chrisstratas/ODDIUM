import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SGPProvider } from "@/contexts/SGPContext";
import Header from "@/components/Header";
import SportsbookSidebar from "@/components/SportsbookSidebar";
import Index from "./pages/Index";
import NBA from "./pages/NBA";
import NFL from "./pages/NFL";
import MLB from "./pages/MLB";
import NHL from "./pages/NHL";
import WNBA from "./pages/WNBA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SGPProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col w-full">
            <Header />
            <div className="flex flex-1 w-full">
              <SportsbookSidebar />
              <main className="flex-1 overflow-auto">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/nba" element={<NBA />} />
                  <Route path="/nfl" element={<NFL />} />
                  <Route path="/mlb" element={<MLB />} />
                  <Route path="/nhl" element={<NHL />} />
                  <Route path="/wnba" element={<WNBA />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </SGPProvider>
  </QueryClientProvider>
);

export default App;
