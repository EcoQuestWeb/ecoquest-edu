import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LevelProgressProvider } from "@/contexts/LevelProgressContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Progress from "./pages/Progress";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import WasteSorting from "./pages/games/WasteSorting";
import EcoPuzzle from "./pages/games/EcoPuzzle";
import EcoWordle from "./pages/games/EcoWordle";
import EnvironmentalQuiz from "./pages/games/EnvironmentalQuiz";
import CarbonFootprint from "./pages/games/CarbonFootprint";
import EcoMatch from "./pages/games/EcoMatch";
import SaveTheForest from "./pages/games/SaveTheForest";
import RapidEcoQuiz from "./pages/games/RapidEcoQuiz";
import OceanCleanup from "./pages/games/OceanCleanup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LevelProgressProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/games/waste-sorting" element={<WasteSorting />} />
              <Route path="/games/eco-puzzle" element={<EcoPuzzle />} />
              <Route path="/games/eco-wordle" element={<EcoWordle />} />
              <Route path="/games/environmental-quiz" element={<EnvironmentalQuiz />} />
              <Route path="/games/carbon-footprint" element={<CarbonFootprint />} />
              <Route path="/games/eco-match" element={<EcoMatch />} />
              <Route path="/games/save-the-forest" element={<SaveTheForest />} />
              <Route path="/games/rapid-eco-quiz" element={<RapidEcoQuiz />} />
              <Route path="/games/ocean-cleanup" element={<OceanCleanup />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LevelProgressProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
